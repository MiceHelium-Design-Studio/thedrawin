
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/notifications/NotificationItem';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
      console.error(error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Stay updated with your latest activity
            </p>
          </div>
          
          {!loading && notifications.some(n => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gold-400 transition-all duration-200 font-medium shadow-sm"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
        
        {/* Content */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                When you have new activity, we'll notify you here so you don't miss anything important.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((notification, index) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "transition-colors duration-200",
                    index === 0 && "rounded-t-2xl",
                    index === notifications.length - 1 && "rounded-b-2xl"
                  )}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
