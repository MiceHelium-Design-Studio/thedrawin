
import { Notification } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { withSecurityChecks, logAuditEvent, RATE_LIMITS, sanitizeInput, validateInput } from '@/utils/securityUtils';

export const useNotificationFunctions = (
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
  notifications: Notification[]
) => {
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load notifications',
          description: 'There was an error loading your notifications. Please try again later.'
        });
        throw error;
      } else if (data) {
        // Map DB fields to our interface
        const mappedNotifications: Notification[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          message: item.message,
          read: item.read,
          type: item.type as 'win' | 'draw' | 'system' | 'promotion',
          createdAt: item.created_at,
          toAll: false
        }));
        setNotifications(mappedNotifications);
      }
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to load notifications',
        description: 'An unexpected error occurred while loading your notifications.'
      });
      throw err;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    return withSecurityChecks(
      async () => {
        const notificationToUpdate = notifications.find(n => n.id === id);
        
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id);

        if (error) {
          console.error('Error marking notification as read:', error);
          toast({
            variant: 'destructive',
            title: 'Failed to mark notification as read',
            description: 'There was an error marking the notification as read. Please try again later.'
          });
          throw error;
        } else {
          setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          ));
          
          // Log the update for audit purposes
          await logAuditEvent({
            action: 'notification_mark_read',
            tableName: 'notifications',
            recordId: id,
            oldValues: notificationToUpdate,
            newValues: { ...notificationToUpdate, read: true },
          });
        }
      },
      {
        auditAction: 'notification_mark_read',
        auditTableName: 'notifications',
      }
    );
  };

  const sendNotification = async (
    userId: string, 
    message: string, 
    type: 'win' | 'draw' | 'system' | 'promotion'
  ) => {
    return withSecurityChecks(
      async () => {
        // Validate and sanitize the message
        const sanitizedMessage = sanitizeInput(message);
        const isMessageValid = await validateInput({ 
          input: sanitizedMessage, 
          type: 'no_script', 
          maxLength: 500 
        });
        
        if (!isMessageValid) {
          throw new Error('Invalid notification message format');
        }

        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            message: sanitizedMessage,
            type: type,
            read: false
          });

        if (error) {
          console.error('Error sending notification:', error);
          toast({
            variant: 'destructive',
            title: 'Failed to send notification',
            description: 'There was an error sending the notification.'
          });
          throw error;
        }

        // Log the notification creation for audit purposes
        await logAuditEvent({
          action: 'notification_send',
          tableName: 'notifications',
          newValues: {
            user_id: userId,
            message: sanitizedMessage,
            type: type,
          },
        });

        toast({
          title: 'Notification sent',
          description: 'The notification has been sent successfully.'
        });
      },
      {
        auditAction: 'notification_send',
        auditTableName: 'notifications',
      }
    );
  };

  return {
    fetchNotifications,
    markNotificationAsRead,
    sendNotification
  };
};
