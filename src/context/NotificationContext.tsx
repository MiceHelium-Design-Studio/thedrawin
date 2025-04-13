
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { BellRing } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (message: string, type: 'system' | 'win' | 'draw' | 'promotion', userIds?: string[]) => Promise<void>;
  addLocalNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
              title: "New Notification",
              description: newNotification.message,
            });
          } catch (error) {
            console.error("Error processing real-time notification:", error);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Helper function to map database fields to app fields
  const mapDatabaseNotificationToAppNotification = (dbNotification: any): Notification => {
    return {
      id: dbNotification.id,
      userId: dbNotification.user_id,
      message: dbNotification.message,
      read: dbNotification.read,
      type: dbNotification.type as 'win' | 'draw' | 'system' | 'promotion',
      createdAt: dbNotification.created_at
    };
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simple direct query that avoids profile relation
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, message, read, type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching notifications:', error);
        // Continue with empty array to allow local notifications to work
      } else {
        // Map database fields to app fields
        const mappedNotifications = (data || []).map(mapDatabaseNotificationToAppNotification);
        setNotifications(mappedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't show toast for this error as it would be annoying on every page load
    } finally {
      setLoading(false);
    }
  };

  // Add a local notification (for when Supabase fails)
  const addLocalNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Show toast for the new local notification
    toast({
      title: "New Notification",
      description: notification.message,
    });
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      // Check if it's a local notification (UUID v4 format)
      const isLocalNotification = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      if (!isLocalNotification) {
        // Try to update in Supabase
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Always update local state
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
      // Check if it's a local notification (UUID v4 format)
      const isLocalNotification = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      if (!isLocalNotification) {
        // Try to delete from Supabase
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Always update local state
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
      // Try to update in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) {
        console.error('Supabase mark all as read error:', error);
      }
      
      // Always update local state
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

  const sendNotification = async (message: string, type: 'system' | 'win' | 'draw' | 'promotion', userIds?: string[]) => {
    if (!user && !userIds) return;
    
    try {
      if (userIds && userIds.length > 0) {
        // Send to specific users
        const promises = userIds.map(async (userId) => {
          try {
            const { error } = await supabase.from('notifications').insert({
              user_id: userId,
              message,
              type
            });
            
            if (error) {
              console.error('Supabase error sending notification:', error);
              // Create a local notification
              const localNotification: Notification = {
                id: uuidv4(),
                userId,
                message,
                read: false,
                type,
                createdAt: new Date().toISOString()
              };
              
              if (userId === user?.id) {
                addLocalNotification(localNotification);
              }
            }
          } catch (e) {
            console.error(`Error sending notification to user ${userId}:`, e);
          }
        });
        
        await Promise.all(promises);
      } else if (user) {
        // Send to current user
        try {
          const { error } = await supabase.from('notifications').insert({
            user_id: user.id,
            message,
            type
          });
          
          if (error) {
            console.error('Supabase error sending notification:', error);
            // Create a local notification
            const localNotification: Notification = {
              id: uuidv4(),
              userId: user.id,
              message,
              read: false,
              type,
              createdAt: new Date().toISOString()
            };
            
            addLocalNotification(localNotification);
          }
        } catch (e) {
          console.error('Error sending notification:', e);
          // Create a local notification
          const localNotification: Notification = {
            id: uuidv4(),
            userId: user.id,
            message,
            read: false,
            type,
            createdAt: new Date().toISOString()
          };
          
          addLocalNotification(localNotification);
        }
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
        sendNotification,
        addLocalNotification
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
