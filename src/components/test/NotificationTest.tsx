
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDraws } from '@/context/DrawContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const NotificationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { draws, buyTicket } = useDraws();
  const { notifications } = useNotifications();
  const { user } = useAuth();
  const { t } = useTranslation();

  const testTicketPurchase = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: t('test.notifications.pleaseLoginFirst'),
        description: t('test.notifications.needToBeLoggedIn')
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
          title: t('test.notifications.noDrawsAvailable'),
          description: t('test.notifications.createDrawFirst')
        });
        return;
      }

      // Generate a random ticket number for testing
      const randomTicketNumber = Math.floor(Math.random() * 100) + 1;

      // Use a default ticket price if ticketPrices is not available
      let ticketPrice = 10; // Default price
      if (testDraw.ticketPrices && Array.isArray(testDraw.ticketPrices) && testDraw.ticketPrices.length > 0) {
        ticketPrice = testDraw.ticketPrices[0];
      }

      console.log('Testing notification system with ticket purchase...');
      console.log('Draw ID:', testDraw.id);
      console.log('Draw Title:', testDraw.title);
      console.log('Ticket Number:', randomTicketNumber);
      console.log('Price:', ticketPrice);

      // This should trigger the database triggers that create notifications
      await buyTicket(testDraw.id, randomTicketNumber, ticketPrice);

      toast({
        title: t('test.notifications.testCompleted'),
        description: t('test.notifications.checkNotifications')
      });

      console.log('Ticket purchase completed - notifications should have been triggered');
    } catch (error) {
      console.error('Test failed:', error);

      // More detailed error handling
      let errorMessage = t('test.notifications.errorOccurred');
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: t('test.notifications.testFailed'),
        description: errorMessage
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
          <CardTitle>{t('test.notifications.notificationSystemTest')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t('test.notifications.testDescription')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('test.notifications.testSubdescription')}
              </p>
            </div>
            <Button
              onClick={testTicketPurchase}
              disabled={isLoading || !user}
              className="ml-4"
            >
              {isLoading ? t('test.notifications.testing') : t('test.notifications.testNotifications')}
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{t('test.notifications.currentNotifications')}</h3>
              <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {t('test.notifications.unreadCount', { count: unreadCount })}
              </span>
            </div>

            {currentNotifications.length === 0 ? (
              <p className="text-sm text-gray-500 italic">{t('test.notifications.noNotificationsYet')}</p>
            ) : (
              <div className="space-y-2">
                {currentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">{notification.title}</p>
                        <p className="text-sm text-black mt-1">{notification.message}</p>
                        <p className="text-xs text-black mt-1">
                          {t('test.notifications.role')}: {notification.role} | {new Date(notification.createdAt).toLocaleString()}
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
            <h4 className="font-medium mb-2">{t('test.notifications.systemStatus')}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                  <span className="text-gray-600">{t('test.notifications.userLoggedIn')}:</span>
                  <span className={`ml-2 ${user ? 'text-green-600' : 'text-red-600'}`}>
                    {user ? `✅ ${t('common.yes')}` : `❌ ${t('common.no')}`}
                  </span>
                </div>
                              <div>
                  <span className="text-gray-600">{t('test.notifications.availableDraws')}:</span>
                  <span className="ml-2 text-blue-600">{draws.length}</span>
                </div>
                              <div>
                  <span className="text-gray-600">{t('test.notifications.totalNotifications')}:</span>
                  <span className="ml-2 text-blue-600">{notifications.length}</span>
                </div>
                              <div>
                  <span className="text-gray-600">{t('test.notifications.userIsAdmin')}:</span>
                  <span className={`ml-2 ${user?.isAdmin ? 'text-green-600' : 'text-gray-600'}`}>
                    {user?.isAdmin ? `✅ ${t('common.yes')}` : `❌ ${t('common.no')}`}
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
