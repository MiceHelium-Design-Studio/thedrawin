
import React from 'react';
import { 
  LayoutDashboard,
  Images,
  BarChart3,
  Users,
  Settings,
  BellRing,
  FileImage
} from 'lucide-react';
import { 
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface AdminSidebarMenuProps {
  activeTab: string;
}

const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({ activeTab }) => {
  return (
    <TabsList className="flex flex-col h-auto w-full bg-muted/50">
      <TabsTrigger value="draws" className="w-full justify-start data-[state=active]:bg-primary/20">
        <LayoutDashboard className="w-4 h-4 mr-2" />
        Draw Management
      </TabsTrigger>
      
      <TabsTrigger value="banners" className="w-full justify-start data-[state=active]:bg-primary/20">
        <Images className="w-4 h-4 mr-2" />
        Banner Management
      </TabsTrigger>
      
      <TabsTrigger value="users" className="w-full justify-start data-[state=active]:bg-primary/20">
        <Users className="w-4 h-4 mr-2" />
        User Management
      </TabsTrigger>
      
      <TabsTrigger value="settings" className="w-full justify-start data-[state=active]:bg-primary/20">
        <Settings className="w-4 h-4 mr-2" />
        App Settings
      </TabsTrigger>
      
      <TabsTrigger value="notifications" className="w-full justify-start data-[state=active]:bg-primary/20">
        <BellRing className="w-4 h-4 mr-2" />
        Push Notifications
      </TabsTrigger>
      
      <TabsTrigger value="stats" className="w-full justify-start data-[state=active]:bg-primary/20">
        <BarChart3 className="w-4 h-4 mr-2" />
        Statistics
      </TabsTrigger>
      
      <TabsTrigger value="media" className="w-full justify-start data-[state=active]:bg-primary/20">
        <FileImage className="w-4 h-4 mr-2" />
        Media Manager
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminSidebarMenu;
