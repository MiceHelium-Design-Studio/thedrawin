
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

interface AdminContentProps {
  activeSection: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
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
      default:
        return <StatisticsContent />;
    }
  };

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  );
};

export default AdminContent;
