
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/notifications/NotificationItem';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const Notifications: React.FC = () => {
  const { notifications, loading, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("Notifications page loaded, count:", notifications.length);
  }, [notifications]);
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      // Error is handled in context with toast
      console.error(error);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast({
        title: 'Notification deleted',
      });
    } catch (error) {
      // Error is handled in context with toast
      console.error(error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      // Error is handled in context with toast
      console.error(error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        {!loading && notifications.some(n => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="text-xs border-gold/40 text-white hover:text-white"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-4">
          <Bell className="h-12 w-12 text-gray-400" />
          <p className="text-white">You have no notifications.</p>
        </div>
      ) : (
        <div>
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
