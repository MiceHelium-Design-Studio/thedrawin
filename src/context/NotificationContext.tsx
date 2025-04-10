
import React, { createContext, useContext, useState } from 'react';
import { Notification } from '../types';

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);

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

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        markAsRead,
        deleteNotification,
        markAllAsRead
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
