
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
  ChevronLeft,
  ChevronRight
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// Import Admin components
import DrawsManagement from '@/components/admin/DrawsManagement';
import BannersManagement from '@/components/admin/BannersManagement';
import UserManagement from '@/components/admin/UserManagement';
import AppSettings from '@/components/admin/AppSettings';
import PushNotifications from '@/components/admin/PushNotifications';

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('draws');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Navigation arrows functionality
  const handleNavigation = (direction: 'prev' | 'next') => {
    const tabs = ['draws', 'banners', 'users', 'settings', 'notifications', 'stats'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
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
      {/* Top Menu */}
      <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-sm">
        <div className="container mx-auto py-2">
          <NavigationMenu className="mx-auto max-w-full justify-start">
            <NavigationMenuList className="w-full flex justify-between items-center">
              <div className="flex items-center">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">Draw Management</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li onClick={() => setActiveTab('draws')} className="cursor-pointer">
                        <NavigationMenuLink 
                          className={`block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground
                            ${activeTab === 'draws' ? 'bg-accent text-accent-foreground' : ''}`}
                        >
                          <div className="text-sm font-medium leading-none">Draws</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Manage lottery draws
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li onClick={() => setActiveTab('stats')} className="cursor-pointer">
                        <NavigationMenuLink 
                          className={`block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground
                            ${activeTab === 'stats' ? 'bg-accent text-accent-foreground' : ''}`}
                        >
                          <div className="text-sm font-medium leading-none">Statistics</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            View draw statistics
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">Banner Management</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li onClick={() => setActiveTab('banners')} className="cursor-pointer">
                        <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Banners</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Update promotional banners
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">User Management</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li onClick={() => setActiveTab('users')} className="cursor-pointer">
                        <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Users</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Manage user accounts
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">App Settings</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li onClick={() => setActiveTab('settings')} className="cursor-pointer">
                        <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Settings</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Configure app settings
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">Notifications</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li onClick={() => setActiveTab('notifications')} className="cursor-pointer">
                        <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Push Notifications</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Send updates to users
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleNavigation('prev')}
                  disabled={activeTab === 'draws'}
                  className="size-8 rounded-full"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleNavigation('next')}
                  disabled={activeTab === 'stats'}
                  className="size-8 rounded-full"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1.5"
                >
                  <LogOut className="size-4" />
                  Exit Admin
                </Button>
              </div>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto py-6 flex-1">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 space-y-2">
            <Card className="p-4 backdrop-blur-sm bg-card/90 shadow-md border-0">
              <div className="space-y-2">
                <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
                
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
                  </TabsList>
                </Tabs>
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <Card className="p-6 backdrop-blur-sm bg-card/90 shadow-md border-0">
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
