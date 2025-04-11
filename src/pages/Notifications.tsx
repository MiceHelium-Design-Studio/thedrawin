
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/notifications/NotificationItem';
import { useToast } from '@/components/ui/use-toast';

const Notifications: React.FC = () => {
  const { notifications, loading, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { toast } = useToast();
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark notification as read.',
      });
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete notification.',
      });
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
      });
      console.error(error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        {notifications.some(n => !n.read) && (
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
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
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
