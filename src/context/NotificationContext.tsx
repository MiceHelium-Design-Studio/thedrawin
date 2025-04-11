
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Bell } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (message: string, type: 'system' | 'win' | 'draw' | 'promotion', userIds?: string[]) => Promise<void>;
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
    
    // Set up real-time subscription
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
          const newNotification = mapDatabaseNotificationToAppNotification(payload.new);
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: "New Notification",
            description: newNotification.message,
          });
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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database fields to app fields
      const mappedNotifications = (data || []).map(mapDatabaseNotificationToAppNotification);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load notifications.',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setLoading(true);
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
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (message: string, type: 'system' | 'win' | 'draw' | 'promotion', userIds?: string[]) => {
    if (!user && !userIds) return;
    
    setLoading(true);
    try {
      if (userIds && userIds.length > 0) {
        // Send to specific users
        const promises = userIds.map(userId => 
          supabase.from('notifications').insert({
            user_id: userId,
            message,
            type
          })
        );
        
        await Promise.all(promises);
      } else if (user) {
        // Send to current user
        const { error } = await supabase.from('notifications').insert({
          user_id: user.id,
          message,
          type
        });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    } finally {
      setLoading(false);
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
