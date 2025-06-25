import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Trash2, Shield } from 'lucide-react';
import NotificationItem from '@/components/notifications/NotificationItem';
import { Skeleton } from '@/components/ui/skeleton';
const AdminNotifications: React.FC = () => {
  const {
    notifications,
    loading,
    markAsRead,
    deleteNotification,
    markAllAsRead
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('all');
  const filteredNotifications = activeTab === 'all' ? notifications : activeTab === 'unread' ? notifications.filter(n => !n.read) : activeTab === 'admin' ? notifications.filter(n => n.role === 'admin') : activeTab === 'user' ? notifications.filter(n => n.role === 'user') : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;
  const adminCount = notifications.filter(n => n.role === 'admin').length;
  const userCount = notifications.filter(n => n.role === 'user').length;
  return <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-yellow-500">Notifications Management</h2>
        
        {!loading && unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={loading}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All
                <span className="ml-2 bg-secondary text-secondary-foreground px-2 rounded-full text-xs">
                  {notifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white px-2 rounded-full text-xs">
                    {unreadCount}
                  </span>}
              </TabsTrigger>
              <TabsTrigger value="admin">
                <Shield className="h-4 w-4 mr-1" />
                Admin
                {adminCount > 0 && <span className="ml-2 bg-orange-500 text-white px-2 rounded-full text-xs">
                    {adminCount}
                  </span>}
              </TabsTrigger>
              <TabsTrigger value="user">
                User
                {userCount > 0 && <span className="ml-2 bg-blue-500 text-white px-2 rounded-full text-xs">
                    {userCount}
                  </span>}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {loading ? <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div> : filteredNotifications.length === 0 ? <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle>No notifications</AlertTitle>
                  <AlertDescription>
                    There are no {activeTab !== 'all' ? activeTab : ''} notifications to display.
                  </AlertDescription>
                </Alert> : <div className="space-y-4">
                  {filteredNotifications.map(notification => <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} onDelete={deleteNotification} />)}
                </div>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>;
};
export default AdminNotifications;