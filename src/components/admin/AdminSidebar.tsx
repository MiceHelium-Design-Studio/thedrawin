
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Tabs } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import AdminSidebarMenu from './AdminSidebarMenu';
import { Separator } from '@/components/ui/separator';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  
  return (
    <div className="md:w-64 space-y-2">
      <Card className="p-4 backdrop-blur-sm bg-card/90 shadow-lg border-0 rounded-xl">
        <div className="space-y-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gold-light">Admin Panel</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 hover:bg-black-light/50 hover:text-gold transition-colors"
              >
                <LogOut className="size-4" />
                Exit
              </Button>
            </div>
            
            <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent my-4" />
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
