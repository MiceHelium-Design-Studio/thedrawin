
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Settings, Users, Image, ListTodo, 
  BellRing, PanelRight, Layout, Medal, Bell
} from 'lucide-react';

interface AdminSidebarMenuProps {
  activeTab?: string;
}

const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({ activeTab }) => {
  return (
    <TabsList className="flex flex-col items-start space-y-1 w-full bg-transparent border-0">
      <TabsTrigger value="draws" className="w-full justify-start">
        <Medal className="h-4 w-4 mr-2" />
        Draws
      </TabsTrigger>
      <TabsTrigger value="banners" className="w-full justify-start">
        <Layout className="h-4 w-4 mr-2" />
        Banners
      </TabsTrigger>
      <TabsTrigger value="users" className="w-full justify-start">
        <Users className="h-4 w-4 mr-2" />
        Users
      </TabsTrigger>
      <TabsTrigger value="notifications" className="w-full justify-start">
        <BellRing className="h-4 w-4 mr-2" />
        Push Notifications
      </TabsTrigger>
      <TabsTrigger value="alerts" className="w-full justify-start">
        <Bell className="h-4 w-4 mr-2" />
        Alerts
      </TabsTrigger>
      <TabsTrigger value="stats" className="w-full justify-start">
        <BarChart className="h-4 w-4 mr-2" />
        Statistics
      </TabsTrigger>
      <TabsTrigger value="media" className="w-full justify-start">
        <Image className="h-4 w-4 mr-2" />
        Media
      </TabsTrigger>
      <TabsTrigger value="todos" className="w-full justify-start">
        <ListTodo className="h-4 w-4 mr-2" />
        Tasks
      </TabsTrigger>
      <TabsTrigger value="settings" className="w-full justify-start">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminSidebarMenu;
