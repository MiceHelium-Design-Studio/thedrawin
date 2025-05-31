
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
    <TabsList className="flex flex-col items-start space-y-2.5 w-full bg-transparent border-0 pt-1 h-auto">
      <TabsTrigger 
        value="draws" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <Medal className="h-4 w-4 mr-2.5" />
        Draws
      </TabsTrigger>
      <TabsTrigger 
        value="banners" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <Layout className="h-4 w-4 mr-2.5" />
        Banners
      </TabsTrigger>
      <TabsTrigger 
        value="users" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <Users className="h-4 w-4 mr-2.5" />
        Users
      </TabsTrigger>
      <TabsTrigger 
        value="notifications" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <BellRing className="h-4 w-4 mr-2.5" />
        Push Notifications
      </TabsTrigger>
      <TabsTrigger 
        value="alerts" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <Bell className="h-4 w-4 mr-2.5" />
        Alerts
      </TabsTrigger>
      <TabsTrigger 
        value="stats" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <BarChart className="h-4 w-4 mr-2.5" />
        Statistics
      </TabsTrigger>
      <TabsTrigger 
        value="media" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <Image className="h-4 w-4 mr-2.5" />
        Media
      </TabsTrigger>
      <TabsTrigger 
        value="todos" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <ListTodo className="h-4 w-4 mr-2.5" />
        Tasks
      </TabsTrigger>
      <TabsTrigger 
        value="settings" 
        className="w-full justify-start rounded-md transition-colors px-3 py-2.5"
      >
        <Settings className="h-4 w-4 mr-2.5" />
        Settings
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminSidebarMenu;
