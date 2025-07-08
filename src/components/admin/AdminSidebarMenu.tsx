
import React from 'react';
import {
  BarChart3,
  Trophy,
  Users,
  Image,
  Bell,
  Settings,
  CreditCard,
  TestTube,
  Ticket,
  MessageSquare,
  Images
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminSidebarMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  activeTab: string;
}

const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({
  activeSection,
  onSectionChange,
  activeTab
}) => {
  const { t } = useTranslation();
  
  const menuItems = [
    { id: 'statistics', label: t('admin.sidebar.statistics'), icon: BarChart3 },
    { id: 'draws', label: t('admin.sidebar.draws'), icon: Trophy },
    { id: 'tickets', label: t('admin.sidebar.tickets'), icon: Ticket },
    { id: 'banners', label: t('admin.sidebar.banners'), icon: Image },
    { id: 'media', label: t('admin.sidebar.mediaLibrary'), icon: Images },
    { id: 'users', label: t('admin.sidebar.users'), icon: Users },
    { id: 'notifications', label: t('admin.sidebar.notifications'), icon: Bell },
    { id: 'notification-test', label: t('admin.sidebar.testNotifications'), icon: TestTube },
    { id: 'payments', label: t('admin.sidebar.paymentSettings'), icon: CreditCard },
    { id: 'push-notifications', label: t('admin.sidebar.pushNotifications'), icon: MessageSquare },
    { id: 'settings', label: t('admin.sidebar.settings'), icon: Settings },
  ];

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${activeTab === item.id
              ? 'bg-[rgb(var(--primary))] text-white'
              : 'text-white hover:text-white hover:bg-[rgb(var(--secondary-system-fill))]/20'
              }`}
            style={{ color: activeTab === item.id ? '#F39C0A' : '#FFFFFF' }}
          >
            <IconComponent
              className="h-4 w-4"
              style={{ color: activeTab === item.id ? '#F39C0A' : '#FFFFFF' }}
            />
            <span style={{ color: activeTab === item.id ? '#F39C0A' : '#FFFFFF' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default AdminSidebarMenu;
