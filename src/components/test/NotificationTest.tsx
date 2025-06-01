
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDraws } from '@/context/DrawContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const NotificationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { draws, buyTicket } = useDraws();
  const { notifications } = useNotifications();
  const { user } = useAuth();

  const testTicketPurchase = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please login first',
        description: 'You need to be logged in to test notifications'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use the first available draw or create a test scenario
      const testDraw = draws[0];
      if (!testDraw) {
        toast({
          variant: 'destructive',
          title: 'No draws available',
          description: 'Please create a draw first to test notifications'
        });
        return;
      }

      // Generate a random ticket number for testing
      const randomTicketNumber = Math.floor(Math.random() * 100) + 1;
      const ticketPrice = testDraw.ticketPrices[0] || 10;

      console.log('Testing notification system with ticket purchase...');
      console.log('Draw ID:', testDraw.id);
      console.log('Ticket Number:', randomTicketNumber);
      console.log('Price:', ticketPrice);

      // This should trigger the database triggers that create notifications
      await buyTicket(testDraw.id, randomTicketNumber, ticketPrice);

      toast({
        title: 'Test completed!',
        description: 'Check your notifications to see if the system is working.'
      });

      console.log('Ticket purchase completed - notifications should have been triggered');
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        variant: 'destructive',
        title: 'Test failed',
        description: 'Error occurred during notification test'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentNotifications = notifications.slice(0, 5); // Show last 5 notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔔 Notification System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Test the notification system by purchasing a ticket
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This should create notifications for both user and admin
              </p>
            </div>
            <Button 
              onClick={testTicketPurchase}
              disabled={isLoading || !user}
              className="ml-4"
            >
              {isLoading ? 'Testing...' : 'Test Notifications'}
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Current Notifications</h3>
              <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            </div>
            
            {currentNotifications.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No notifications yet</p>
            ) : (
              <div className="space-y-2">
                {currentNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Role: {notification.role} | {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">System Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">User logged in:</span>
                <span className={`ml-2 ${user ? 'text-green-600' : 'text-red-600'}`}>
                  {user ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Available draws:</span>
                <span className="ml-2 text-blue-600">{draws.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Total notifications:</span>
                <span className="ml-2 text-blue-600">{notifications.length}</span>
              </div>
              <div>
                <span className="text-gray-600">User is admin:</span>
                <span className={`ml-2 ${user?.isAdmin ? 'text-green-600' : 'text-gray-600'}`}>
                  {user?.isAdmin ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTest;
