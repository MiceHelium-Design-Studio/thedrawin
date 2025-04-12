
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Award, Calendar, CheckCircle, Trash2, Gift } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../types';
import { cn } from '../../lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'win':
        return <Award className="h-5 w-5 text-green-500" />;
      case 'draw':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'system':
      default:
        return <Bell className="h-5 w-5 text-gold" />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true
  });

  return (
    <Card className={cn(
      "p-4 mb-3 transition-colors border border-gray-800",
      notification.read 
        ? "bg-gray-900/60"
        : "bg-gray-800/80 border-l-4 border-l-gold shadow-md"
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-1 bg-black/40 p-2 rounded-full">{getIcon()}</div>
        
        <div className="flex-1">
          <p className={cn(
            "mb-1 text-white",
            !notification.read && "font-medium"
          )}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400">{timeAgo}</p>
        </div>
        
        <div className="flex space-x-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-green-500 hover:bg-green-500/10"
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            onClick={() => onDelete(notification.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NotificationItem;
