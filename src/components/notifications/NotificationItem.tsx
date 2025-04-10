
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Award, Calendar, CheckCircle, Trash2 } from 'lucide-react';
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
      "p-4 mb-3 transition-colors",
      notification.read ? "bg-gray-50" : "bg-white border-l-4 border-l-gold"
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-1">{getIcon()}</div>
        
        <div className="flex-1">
          <p className={cn(
            "mb-1",
            !notification.read && "font-medium"
          )}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500">{timeAgo}</p>
        </div>
        
        <div className="flex space-x-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-green-500"
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-500"
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
