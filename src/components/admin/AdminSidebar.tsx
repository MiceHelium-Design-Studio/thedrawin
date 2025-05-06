
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Tabs } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import AdminSidebarMenu from './AdminSidebarMenu';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  
  return (
    <div className="md:w-64 space-y-2">
      <Card className="p-4 backdrop-blur-sm bg-card/90 shadow-md border-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5"
            >
              <LogOut className="size-4" />
              Exit
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <AdminSidebarMenu activeTab={activeTab} />
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default AdminSidebar;
