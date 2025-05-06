
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";

// Import Admin components
import DrawsManagement from '@/components/admin/DrawsManagement';
import BannersManagement from '@/components/admin/BannersManagement';
import UserManagement from '@/components/admin/UserManagement';
import AppSettings from '@/components/admin/AppSettings';
import PushNotifications from '@/components/admin/PushNotifications';
import MediaManager from '@/components/admin/MediaManager';
import StatisticsContent from './StatisticsContent';
import TodoPage from '@/pages/TodoPage';
import AdminNotifications from './AdminNotifications';

interface AdminContentProps {
  activeTab: string;
}

const AdminContent: React.FC<AdminContentProps> = ({ activeTab }) => {
  return (
    <div className="flex-1 space-y-6">
      <Card className="p-6 backdrop-blur-sm bg-card/90 shadow-md border-0">
        {/* IMPORTANT: We're wrapping all TabsContent components within a Tabs component */}
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="draws" className="mt-0">
            <DrawsManagement />
          </TabsContent>
          
          <TabsContent value="banners" className="mt-0">
            <BannersManagement />
          </TabsContent>
          
          <TabsContent value="users" className="mt-0">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <AppSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <PushNotifications />
          </TabsContent>
          
          <TabsContent value="alerts" className="mt-0">
            <AdminNotifications />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <StatisticsContent />
          </TabsContent>
          
          <TabsContent value="media" className="mt-0">
            <MediaManager />
          </TabsContent>
          
          <TabsContent value="todos" className="mt-0">
            <TodoPage />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminContent;
