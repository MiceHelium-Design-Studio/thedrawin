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
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
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
          try {
            // Only show admin notifications if user is admin
            if (user?.email === 'raghidhilal@gmail.com') {
              const newNotification = mapDatabaseNotificationToAppNotification(payload.new);
              setNotifications(prev => [newNotification, ...prev]);
              
              toast({
                title: newNotification.title || "Admin Notification",
                description: newNotification.message,
              });
            }
          } catch (error) {
            console.error("Error processing real-time admin notification:", error);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch both user and admin notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, role, title, message, read, created_at')
        .or(`user_id.eq.${user.id},role.eq.admin`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database fields to app fields
      const mappedNotifications = (data || []).map(mapDatabaseNotificationToAppNotification);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
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
    if (!user && !userIds) return;
    
    try {
      if (userIds && userIds.length > 0) {
        // Send to specific users
        const promises = userIds.map(userId => 
          supabase.from('notifications').insert({
            user_id: userId,
            role: role,
            title: role.charAt(0).toUpperCase() + role.slice(1),
            message
          })
        );
        
        await Promise.all(promises);
      } else if (user) {
        // Send to current user
        const { error } = await supabase.from('notifications').insert({
          user_id: user.id,
          role: role,
          title: role.charAt(0).toUpperCase() + role.slice(1),
          message
        });
        
        if (error) throw error;
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
