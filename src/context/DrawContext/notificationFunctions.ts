
import { Notification } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    try {
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
      }
    } catch (err) {
      console.error('Unexpected error marking notification as read:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to mark notification as read',
        description: 'An unexpected error occurred while marking the notification as read.'
      });
      throw err;
    }
  };

  return {
    fetchNotifications,
    markNotificationAsRead
  };
};
