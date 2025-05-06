
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard,
  Images,
  BarChart3,
  Users,
  Settings,
  BellRing,
  LogOut,
  FileImage
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Admin components
import DrawsManagement from '@/components/admin/DrawsManagement';
import BannersManagement from '@/components/admin/BannersManagement';
import UserManagement from '@/components/admin/UserManagement';
import AppSettings from '@/components/admin/AppSettings';
import PushNotifications from '@/components/admin/PushNotifications';
import MediaManager from '@/components/admin/MediaManager';

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('draws');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'You do not have permission to access this page.',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);
  
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Main Content */}
      <div className="container mx-auto py-6 flex-1">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
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
                </Tabs>
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
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
                
                <TabsContent value="stats" className="mt-0">
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-semibold">Statistics</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
                        <div className="p-6">
                          <h3 className="text-lg font-medium">Total Draws</h3>
                          <p className="text-3xl font-bold mt-2">3</p>
                        </div>
                      </Card>
                      
                      <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
                        <div className="p-6">
                          <h3 className="text-lg font-medium">Active Draws</h3>
                          <p className="text-3xl font-bold mt-2">1</p>
                        </div>
                      </Card>
                      
                      <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
                        <div className="p-6">
                          <h3 className="text-lg font-medium">Completed Draws</h3>
                          <p className="text-3xl font-bold mt-2">1</p>
                        </div>
                      </Card>
                    </div>
                  </section>
                </TabsContent>
                
                <TabsContent value="media" className="mt-0">
                  <MediaManager />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
