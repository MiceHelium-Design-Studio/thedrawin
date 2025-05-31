import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Settings, Users, Image, ListTodo, 
  BellRing, PanelRight, Layout, Medal, Bell
} from 'lucide-react';
import Database from 'lucide-react/dist/icons/database';

interface AdminSidebarMenuProps {
  activeTab?: string;
}

const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({ activeTab }) => {
  const menuItems = [
    {
      id: "draws",
      label: "Draws",
      icon: Medal,
      description: "Draws statistics"
    },
    {
      id: "banners",
      label: "Banners",
      icon: Layout,
      description: "Banners statistics"
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      description: "Users statistics"
    },
    {
      id: "notifications",
      label: "Push Notifications",
      icon: BellRing,
      description: "Push Notifications statistics"
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      description: "Alerts statistics"
    },
    {
      id: "stats",
      label: "Statistics",
      icon: BarChart,
      description: "Statistics statistics"
    },
    {
      id: "media",
      label: "Media",
      icon: Image,
      description: "Media statistics"
    },
    {
      id: "todos",
      label: "Tasks",
      icon: ListTodo,
      description: "Tasks statistics"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Settings statistics"
    },
    {
      id: "index-usage",
      label: "Index Usage",
      icon: Database,
      description: "Database index statistics"
    }
  ];

  return (
    <TabsList className="flex flex-col items-start space-y-2.5 w-full bg-transparent border-0 pt-1 h-auto">
      {menuItems.map((item) => (
        <TabsTrigger 
          key={item.id} 
          value={item.id} 
          className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
        >
          {item.icon && <item.icon className="h-4 w-4 mr-2.5" />}
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default AdminSidebarMenu;
