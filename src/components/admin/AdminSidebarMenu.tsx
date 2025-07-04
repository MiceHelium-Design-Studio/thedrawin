
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
  const menuItems = [
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'draws', label: 'Draws', icon: Trophy },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'media', label: 'Media Library', icon: Images },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'notification-test', label: 'Test Notifications', icon: TestTube },
    { id: 'payments', label: 'Payment Settings', icon: CreditCard },
    { id: 'push-notifications', label: 'Push Notifications', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
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
