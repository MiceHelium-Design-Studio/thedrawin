
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
      <Card className="p-5 backdrop-blur-sm bg-card/90 shadow-lg border-0 rounded-xl overflow-hidden">
        <div className="flex flex-col h-full space-y-6">
          {/* Header Section */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Medal className="size-6 text-[rgb(var(--primary))]" />
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-[rgb(var(--label-primary))]">Admin Panel</h2>
                <Separator className="bg-gradient-to-r from-transparent via-[rgb(var(--primary))]/30 to-transparent mt-2" />
              </div>
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 hover:bg-[rgb(var(--secondary-system-fill))]/20 hover:text-[rgb(var(--primary))] transition-colors w-full justify-start px-3 py-2 text-[rgb(var(--label-primary))]"
              >
                <LogOut className="size-4" />
                Exit Admin
              </Button>
            </div>
          </div>
          
          {/* Navigation Menu - explicitly contained */}
          <div className="flex-grow mt-2">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              orientation="vertical" 
              className="w-full"
            >
              <div className="w-full">
                <AdminSidebarMenu 
                  activeSection={activeTab} 
                  onSectionChange={setActiveTab}
                  activeTab={activeTab}
                />
              </div>
            </Tabs>
          </div>
        </div>
      </Card>
    </aside>
  );
};

export default AdminSidebar;
