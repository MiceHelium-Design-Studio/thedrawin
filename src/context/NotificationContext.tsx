
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (message: string, role: 'admin' | 'user', userIds?: string[]) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper function to map database fields to app fields
  const mapDatabaseNotificationToAppNotification = (dbNotification: any): Notification => {
    return {
      id: dbNotification.id,
      userId: dbNotification.user_id,
      message: dbNotification.message,
      read: dbNotification.read,
      createdAt: dbNotification.created_at,
      title: dbNotification.title || '',
      role: dbNotification.role
    };
  };

  // Fetch notifications on user login
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification received:', payload);
          try {
            const newNotification = mapDatabaseNotificationToAppNotification(payload.new);
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show toast for new notification
            toast({
              title: newNotification.title || "New Notification",
              description: newNotification.message,
            });
          } catch (error) {
            console.error("Error processing real-time notification:", error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `role=eq.admin`,
        },
        (payload) => {
          console.log('New admin notification received:', payload);
          try {
            // Show admin notifications to all users
            const newNotification = mapDatabaseNotificationToAppNotification(payload.new);
            setNotifications(prev => [newNotification, ...prev]);
            
            toast({
              title: newNotification.title || "Admin Notification",
              description: newNotification.message,
            });
          } catch (error) {
            console.error("Error processing real-time admin notification:", error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('Notification updated:', payload);
          try {
            const updatedNotification = mapDatabaseNotificationToAppNotification(payload.new);
            setNotifications(prev =>
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          } catch (error) {
            console.error("Error processing notification update:", error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('Notification deleted:', payload);
          try {
            const deletedId = payload.old.id;
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
          } catch (error) {
            console.error("Error processing notification deletion:", error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });
    
    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching notifications for user:', user.id);
      
      // Fetch both user-specific and admin notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, role, title, message, read, created_at')
        .or(`user_id.eq.${user.id},role.eq.admin`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data);
      
      // Map database fields to app fields
      const mappedNotifications = (data || []).map(mapDatabaseNotificationToAppNotification);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading notifications',
        description: 'Failed to load notifications. Please try again.',
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      console.log('Marking notification as read:', id);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      return;
    } catch (error) {
      console.error('Mark as read error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark notification as read.',
      });
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    
    try {
      console.log('Deleting notification:', id);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      return;
    } catch (error) {
      console.error('Delete notification error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete notification.',
      });
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      console.log('Marking all notifications as read for user:', user.id);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .or(`user_id.eq.${user.id},role.eq.admin`)
        .eq('read', false);
      
      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      return;
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
      });
      throw error;
    }
  };

  const sendNotification = async (message: string, role: 'admin' | 'user', userIds?: string[]) => {
    try {
      console.log('Sending notification:', { message, role, userIds });
      
      if (userIds && userIds.length > 0) {
        // Send to specific users
        const promises = userIds.map(userId => 
          supabase.from('notifications').insert({
            user_id: userId,
            role: role,
            title: role === 'admin' ? 'Admin Message' : 'Notification',
            message
          })
        );
        
        const results = await Promise.all(promises);
        
        // Check for errors
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          console.error('Errors sending notifications:', errors);
          throw new Error('Some notifications failed to send');
        }
        
        console.log('Notifications sent successfully to', userIds.length, 'users');
      } else if (user) {
        // Send to current user
        const { error } = await supabase.from('notifications').insert({
          user_id: user.id,
          role: role,
          title: role === 'admin' ? 'Admin Message' : 'Notification',
          message
        });
        
        if (error) throw error;
        console.log('Notification sent successfully to current user');
      }
      return;
    } catch (error) {
      console.error('Send notification error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send notification.',
      });
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        sendNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
