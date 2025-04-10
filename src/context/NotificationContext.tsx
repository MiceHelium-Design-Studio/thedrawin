import React, { createContext, useContext, useState } from 'react';
import { Notification } from '../types';
import { useToast } from '@/components/ui/use-toast';

// Mock data until we integrate with Supabase
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: '1',
    message: 'Welcome to Gold Coin Raffles!',
    read: false,
    type: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    message: 'New draw available: Weekend Gold Coin Rush',
    read: false,
    type: 'draw',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

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
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const markAsRead = async (id: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
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
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        userId: userIds ? userIds[0] : 'all', // If userIds is provided, take the first one, otherwise 'all'
        message,
        read: false,
        type: type as 'system' | 'win' | 'draw', // Cast to the valid types in Notification
        createdAt: new Date().toISOString(),
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: "Notification sent",
        description: userIds 
          ? `Sent to ${userIds.length} specific user(s)` 
          : "Sent to all users",
      });
      
    } catch (error) {
      console.error('Send notification error:', error);
      toast({
        variant: 'destructive',
        title: "Failed to send notification",
        description: "There was an error sending the notification.",
      });
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
