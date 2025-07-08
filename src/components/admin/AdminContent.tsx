import React from 'react';
import StatisticsContent from './StatisticsContent';
import DrawsManagement from './DrawsManagement';
import BannersManagement from './BannersManagement';
import MediaManager from './MediaManager';
import UserManagement from './UserManagement';
import AdminNotifications from './AdminNotifications';
import NotificationTestPanel from './NotificationTestPanel';
import TicketsOverview from './TicketsOverview';
import AppSettings from './AppSettings';
import PaymentSettings from './PaymentSettings';
import PushNotifications from './PushNotifications';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AdminContentProps {
  activeSection: string;
  activeTab: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ activeSection, activeTab }) => {
  const { t } = useTranslation();
  
  const renderContent = () => {
    try {
      switch (activeSection || activeTab) {
        case 'statistics':
          return <StatisticsContent />;
        case 'draws':
          return <DrawsManagement />;
        case 'tickets':
          return <TicketsOverview />;
        case 'banners':
          return <BannersManagement />;
        case 'media':
          return <MediaManager />;
        case 'users':
          return <UserManagement />;
        case 'notifications':
          return <AdminNotifications />;
        case 'notification-test':
          return <NotificationTestPanel />;
        case 'settings':
          return <AppSettings />;
        case 'payments':
          return <PaymentSettings />;
        case 'push-notifications':
          return <PushNotifications />;
        case '':
        case null:
        case undefined:
          return <StatisticsContent />;
        default:
          return (
            <Alert className="max-w-2xl mx-auto mt-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('admin.content.unknownSection', { section: activeSection || activeTab })}
              </AlertDescription>
            </Alert>
          );
      }
    } catch (error) {
      console.error('Error rendering admin content:', error);
      return (
        <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('admin.content.errorLoadingSection')}
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
