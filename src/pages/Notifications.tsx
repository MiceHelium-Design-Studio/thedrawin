
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0D0D0D] hero-glow">
      <div className="max-w-4xl mx-auto px-4 py-8 luxury-fade-in">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F39C0A]/20 to-[#FFD700]/10 rounded-xl flex items-center justify-center border border-[#F39C0A]/20">
              <Bell className="h-6 w-6 text-[#F39C0A]" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="bg-gradient-to-r from-[#F39C0A] via-[#FFD700] to-[#F39C0A] bg-clip-text text-transparent">
                Notifications
              </span>
            </h1>
          </div>

          {!loading && notifications.some(n => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="group"
            >
              <CheckCheck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Enhanced Content */}
        <div className="luxury-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border border-white/10 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-[#2A2A2A]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-[#2A2A2A] gold-shimmer" />
                      <Skeleton className="h-3 w-1/2 bg-[#2A2A2A] gold-shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6 gold-pulse">
                <Bell className="h-10 w-10 text-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-poppins">
                No notifications yet
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto font-inter">
                When you have new activity, we'll notify you here so you don't miss anything important.
              </p>
              <div className="mt-6">
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "transition-all duration-300 hover:bg-white/5",
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
