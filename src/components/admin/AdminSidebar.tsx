
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Medal } from 'lucide-react';
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
    <aside className="h-fit">
      <Card className="p-5 backdrop-blur-sm bg-card/90 shadow-lg border-0 rounded-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Medal className="size-6 text-gold" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-gold-light">Admin Panel</h2>
              <Separator className="bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-2" />
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 hover:bg-black-light/50 hover:text-gold transition-colors w-full justify-start px-3 py-2"
            >
              <LogOut className="size-4" />
              Exit Admin
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <AdminSidebarMenu activeTab={activeTab} />
          </Tabs>
        </div>
      </Card>
    </aside>
  );
};

export default AdminSidebar;
