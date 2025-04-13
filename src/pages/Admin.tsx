
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Image, Plus, DollarSign, Calendar, Upload, FolderOpen, PaintBucket, Edit, 
  Users, UserCheck, UserX, Search, Filter, Bell, BellRing, MessageSquare, Send,
  Type, Palette, Bold, Italic, Underline, Save, Trash, X, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDraws } from '../context/DrawContext';
import { useBackground } from '../context/BackgroundContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '@/components/ui/use-toast';
import { Draw, Banner, User } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    avatar: '/placeholder.svg',
    wallet: 200,
    isAdmin: true,
  },
  {
    id: '2',
    email: 'user1@example.com',
    name: 'Regular User 1',
    avatar: '/placeholder.svg',
    wallet: 50,
    isAdmin: false,
  },
  {
    id: '3',
    email: 'user2@example.com',
    name: 'Regular User 2',
    avatar: '/placeholder.svg',
    wallet: 75,
    isAdmin: false,
  },
  {
    id: '4',
    email: 'user3@example.com',
    name: 'VIP User',
    avatar: '/placeholder.svg',
    wallet: 500,
    isAdmin: false,
  }
];

const Admin: React.FC = () => {
  const { user, forceAdminAccess } = useAuth();
  const { draws, banners, media, createDraw, updateDraw, createBanner, updateBanner, deleteBanner, uploadMedia, deleteMedia, loading } = useDraws();
  const { authBackgroundImage, setAuthBackgroundImage } = useBackground();
  const { sendNotification, notifications } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);
  const drawFileInputRef = useRef<HTMLInputElement>(null);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [newDraw, setNewDraw] = useState<Omit<Draw, 'id'>>({
    title: '',
    description: '',
    maxParticipants: 100,
    currentParticipants: 0,
    ticketPrices: [5, 10, 20],
    status: 'upcoming',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    bannerImage: '',
  });
  
  const [editingDraw, setEditingDraw] = useState<Draw | null>(null);
  
  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id'>>({
    imageUrl: '',
    linkUrl: '',
    active: true,
  });
  
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'system' | 'win' | 'draw' | 'promotion'>('system');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sendToAllUsers, setSendToAllUsers] = useState(true);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [fontFamily, setFontFamily] = useState<string>("Lato");
  const [primaryColor, setPrimaryColor] = useState<string>("#D4AF37");
  const [secondaryColor, setSecondaryColor] = useState<string>("#222222");
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [fontsList] = useState<string[]>([
    "Lato", "Arial", "Helvetica", "Verdana", "Georgia", "Times New Roman"
  ]);
  
  const [appearanceChanged, setAppearanceChanged] = useState(false);
  
  const handleNotificationTypeChange = (value: 'system' | 'win' | 'draw' | 'promotion') => {
    setNotificationType(value);
  };
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleAdminStatus = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
      )
    );
    
    toast({
      title: 'User role updated',
      description: `User status has been changed successfully.`,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedItem = await uploadMedia(files[0]);
      toast({
        title: 'File uploaded',
        description: `${uploadedItem.name} has been uploaded successfully.`,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
      });
      console.error(error);
    }
  };
  
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedItem = await uploadMedia(files[0]);
      
      if (editingBanner) {
        setEditingBanner({
          ...editingBanner,
          imageUrl: uploadedItem.url
        });
      } else {
        setNewBanner(prev => ({
          ...prev,
          imageUrl: uploadedItem.url
        }));
      }
      
      toast({
        title: 'Banner image uploaded',
        description: `${uploadedItem.name} has been uploaded successfully and set as the banner image.`,
      });
      
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your banner image.',
      });
      console.error(error);
    }
  };
  
  const handleBgImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedItem = await uploadMedia(files[0]);
      
      setAuthBackgroundImage(uploadedItem.url);
      
      toast({
        title: 'Background image uploaded',
        description: `${uploadedItem.name} has been set as the login background image.`,
      });
      
      if (bgImageFileInputRef.current) {
        bgImageFileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your background image.',
      });
      console.error(error);
    }
  };
  
  const handleDrawInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (editingDraw) {
      setEditingDraw(prev => {
        if (!prev) return prev;
        return { ...prev, [name]: value };
      });
    } else {
      setNewDraw(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleDrawTicketPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prices = value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    
    if (editingDraw) {
      setEditingDraw(prev => {
        if (!prev) return prev;
        return { ...prev, ticketPrices: prices };
      });
    } else {
      setNewDraw(prev => ({ ...prev, ticketPrices: prices }));
    }
  };
  
  const handleDrawStatusChange = (value: string) => {
    if (editingDraw) {
      setEditingDraw(prev => {
        if (!prev) return prev;
        return { ...prev, status: value as 'active' | 'upcoming' | 'completed' };
      });
    }
  };

  const handleDrawFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedItem = await uploadMedia(files[0]);
      
      if (editingDraw) {
        setEditingDraw({
          ...editingDraw,
          bannerImage: uploadedItem.url
        });
      } else {
        setNewDraw(prev => ({
          ...prev,
          bannerImage: uploadedItem.url
        }));
      }
      
      toast({
        title: 'Draw image uploaded',
        description: `${uploadedItem.name} has been uploaded successfully and set as the draw image.`,
      });
      
      if (drawFileInputRef.current) {
        drawFileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your draw image.',
      });
      console.error(error);
    }
  };
  
  const handleCreateDraw = async () => {
    try {
      await createDraw(newDraw);
      setNewDraw({
        title: '',
        description: '',
        maxParticipants: 100,
        currentParticipants: 0,
        ticketPrices: [5, 10, 20],
        status: 'upcoming',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        bannerImage: '',
      });
      toast({
        title: 'Draw created',
        description: 'The new draw has been created successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Creation failed',
        description: 'There was an error creating the draw.',
      });
      console.error(error);
    }
  };
  
  const handleUpdateDraw = async () => {
    if (!editingDraw) return;
    
    try {
      await updateDraw(editingDraw.id, editingDraw);
      setEditingDraw(null);
      toast({
        title: 'Draw updated',
        description: 'The draw has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was an error updating the draw.',
      });
      console.error(error);
    }
  };
  
  const handleEditDraw = (draw: Draw) => {
    setEditingDraw(draw);
  };
  
  const handleCancelEditDraw = () => {
    setEditingDraw(null);
  };
  
  const handleDeleteDrawImage = () => {
    if (editingDraw) {
      setEditingDraw({
        ...editingDraw,
        bannerImage: ''
      });
    } else {
      setNewDraw(prev => ({
        ...prev,
        bannerImage: ''
      }));
    }
    
    toast({
      title: 'Image removed',
      description: 'The draw image has been removed.',
    });
  };
  
  const handleCreateBanner = async () => {
    try {
      await createBanner(newBanner);
      setNewBanner({
        imageUrl: '',
        linkUrl: '',
        active: true,
      });
      toast({
        title: 'Banner created',
        description: 'The new banner has been created successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Creation failed',
        description: 'There was an error creating the banner.',
      });
      console.error(error);
    }
  };
  
  const handleUpdateBanner = async () => {
    if (!editingBanner) return;
    
    try {
      await updateBanner(editingBanner.id, editingBanner);
      setEditingBanner(null);
      toast({
        title: 'Banner updated',
        description: 'The banner has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was an error updating the banner.',
      });
      console.error(error);
    }
  };
  
  const handleDeleteBanner = async (bannerId: string) => {
    try {
      await deleteBanner(bannerId);
      
      if (editingBanner?.id === bannerId) {
        setEditingBanner(null);
      }
      
      toast({
        title: 'Banner deleted',
        description: 'The banner has been deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: 'There was an error deleting the banner.',
      });
      console.error(error);
    }
  };
  
  const handleDeleteBannerImage = () => {
    if (editingBanner) {
      setEditingBanner({
        ...editingBanner,
        imageUrl: ''
      });
    } else {
      setNewBanner(prev => ({
        ...prev,
        imageUrl: ''
      }));
    }
    
    toast({
      title: 'Image removed',
      description: 'The banner image has been removed.',
    });
  };
  
  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
  };
  
  const handleCancelEdit = () => {
    setEditingBanner(null);
  };
  
  const handleToggleBannerStatus = async (banner: Banner) => {
    try {
      await updateBanner(banner.id, { active: !banner.active });
      toast({
        title: `Banner ${banner.active ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was an error updating the banner status.',
      });
      console.error(error);
    }
  };
  
  const handleBannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (editingBanner) {
      setEditingBanner(prev => ({
        ...prev!,
        [name]: value
      }));
    } else {
      setNewBanner(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast({
        variant: 'destructive',
        title: "Message required",
        description: "Please enter a notification message.",
      });
      return;
    }

    try {
      if (sendToAllUsers) {
        await sendNotification(notificationMessage, notificationType);
      } else {
        if (selectedUserIds.length === 0) {
          toast({
            variant: 'destructive',
            title: "No users selected",
            description: "Please select at least one user to send the notification to.",
          });
          return;
        }
        await sendNotification(notificationMessage, notificationType, selectedUserIds);
      }
      
      setNotificationMessage('');
      setNotificationType('system');
      setSelectedUserIds([]);
      setSendToAllUsers(true);
      setShowUserSelector(false);
      setDialogOpen(false);
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };
  
  const handleUserSelectionChange = (userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  const toggleSendToAllUsers = () => {
    setSendToAllUsers(!sendToAllUsers);
    setShowUserSelector(!sendToAllUsers);
    if (sendToAllUsers) {
      setSelectedUserIds([]);
    }
  };
  
  const handleFontChange = (value: string) => {
    setFontFamily(value);
    setAppearanceChanged(true);
  };
  
  const handleColorChange = (colorType: 'primary' | 'secondary' | 'background', value: string) => {
    switch (colorType) {
      case 'primary':
        setPrimaryColor(value);
        break;
      case 'secondary':
        setSecondaryColor(value);
        break;
      case 'background':
        setBackgroundColor(value);
        break;
    }
    
    setAppearanceChanged(true);
  };
  
  const saveAppearanceSettings = () => {
    document.documentElement.style.setProperty('--font-sans', fontFamily);
    document.documentElement.style.setProperty('--primary', convertHexToHsl(primaryColor));
    document.documentElement.style.setProperty('--secondary', convertHexToHsl(secondaryColor));
    document.documentElement.style.setProperty('--background', convertHexToHsl(backgroundColor));
    
    localStorage.setItem('app-font-family', fontFamily);
    localStorage.setItem('app-primary-color', primaryColor);
    localStorage.setItem('app-secondary-color', secondaryColor);
    localStorage.setItem('app-background-color', backgroundColor);
    
    setAppearanceChanged(false);
    
    toast({
      title: 'Appearance settings saved',
      description: 'Your font and color settings have been applied to the application.',
    });
  };
  
  const convertHexToHsl = (hex: string): string => {
    return hex;
  };
  
  useEffect(() => {
    const savedFontFamily = localStorage.getItem('app-font-family');
    const savedPrimaryColor = localStorage.getItem('app-primary-color');
    const savedSecondaryColor = localStorage.getItem('app-secondary-color');
    const savedBackgroundColor = localStorage.getItem('app-background-color');
    
    if (savedFontFamily) {
      setFontFamily(savedFontFamily);
      document.documentElement.style.setProperty('--font-sans', savedFontFamily);
    }
    
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
      document.documentElement.style.setProperty('--primary', convertHexToHsl(savedPrimaryColor));
    }
    
    if (savedSecondaryColor) {
      setSecondaryColor(savedSecondaryColor);
      document.documentElement.style.setProperty('--secondary', convertHexToHsl(savedSecondaryColor));
    }
    
    if (savedBackgroundColor) {
      setBackgroundColor(savedBackgroundColor);
      document.documentElement.style.setProperty('--background', convertHexToHsl(savedBackgroundColor));
    }
  }, []);
  
  // Force admin access for specific user
  const handleForceAdminAccess = async () => {
    try {
      await forceAdminAccess('raghidhilal@gmail.com');
      setAdminEmailInput('');
    } catch (error) {
      console.error('Error setting admin access:', error);
    }
  };

  useEffect(() => {
    // Force admin access for raghidhilal@gmail.com on component mount
    if (user) {
      handleForceAdminAccess();
    }
  }, [user]);

  // Only check if user is admin after initial load
  const [checkAdminStatus, setCheckAdminStatus] = useState(false);

  useEffect(() => {
    // Set timeout to avoid immediate redirect
    const timer = setTimeout(() => {
      setCheckAdminStatus(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Skip admin check initially to allow the admin status update to potentially happen
  if (checkAdminStatus && user && !user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need administrator privileges to access this page.</p>
            <div className="flex flex-col space-y-4">
              <div>
                <Label htmlFor="adminEmail">Grant Admin Access</Label>
                <div className="flex mt-1">
                  <Input 
                    id="adminEmail" 
                    value={adminEmailInput} 
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="Email address" 
                    className="flex-1 mr-2"
                  />
                  <Button onClick={() => forceAdminAccess(adminEmailInput)}>
                    Make Admin
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter an email address to grant admin privileges.
                </p>
              </div>
              <Button 
                className="bg-gold hover:bg-gold-dark text-black"
                onClick={handleForceAdminAccess}
              >
                Make raghidhilal@gmail.com Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm">Grant admin privileges to a user by email:</p>
            <div className="flex mt-2">
              <Input 
                value={adminEmailInput} 
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="Email address" 
                className="flex-1 mr-2 border-gold/30 focus:border-gold"
              />
              <Button 
                onClick={() => forceAdminAccess(adminEmailInput)}
                className="bg-gold hover:bg-gold-dark text-black"
                disabled={!adminEmailInput}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Grant Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="draws">
        <div className="relative mb-6 overflow-hidden">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border" showControls>
            <TabsList className="inline-flex h-10 w-full min-w-max">
              <TabsTrigger value="draws" className="px-4">Draws</TabsTrigger>
              <TabsTrigger value="banners" className="px-4">Banners</TabsTrigger>
              <TabsTrigger value="users" className="px-4">Users</TabsTrigger>
              <TabsTrigger value="notifications" className="px-4">Notifications</TabsTrigger>
              <TabsTrigger value="media" className="px-4">Media</TabsTrigger>
              <TabsTrigger value="appearance" className="px-4">Appearance</TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>
        
        <TabsContent value="draws">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{editingDraw ? 'Edit Draw' : 'Create New Draw'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={editingDraw ? editingDraw.title : newDraw.title}
                      onChange={handleDrawInputChange}
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={editingDraw ? editingDraw.description : newDraw.description}
                      onChange={handleDrawInputChange}
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input
                        id="maxParticipants"
                        name="maxParticipants"
                        type="number"
                        value={editingDraw ? editingDraw.maxParticipants : newDraw.maxParticipants}
                        onChange={handleDrawInputChange}
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    
                    {editingDraw && (
                      <div>
                        <Label htmlFor="currentParticipants">Current Participants</Label>
                        <Input
                          id="currentParticipants"
                          name="currentParticipants"
                          type="number"
                          value={editingDraw.currentParticipants}
                          onChange={handleDrawInputChange}
                          className="border-gold/30 focus:border-gold"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="ticketPrices">Ticket Prices (comma separated)</Label>
                      <Input
                        id="ticketPrices"
                        value={editingDraw ? editingDraw.ticketPrices.join(', ') : newDraw.ticketPrices.join(', ')}
                        onChange={handleDrawTicketPriceChange}
                        placeholder="5, 10, 20"
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    
                    {editingDraw && (
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={editingDraw.status}
                          onValueChange={handleDrawStatusChange}
                        >
                          <SelectTrigger className="border-gold/30 focus:border-gold">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={new Date(editingDraw ? editingDraw.startDate : newDraw.startDate).toISOString().split('T')[0]}
                          onChange={handleDrawInputChange}
                          className="pl-10 border-gold/30 focus:border-gold"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={new Date(editingDraw ? editingDraw.endDate : newDraw.endDate).toISOString().split('T')[0]}
                          onChange={handleDrawInputChange}
                          className="pl-10 border-gold/30 focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="uploadDrawImage">Draw Image</Label>
                    <div className="flex gap-2 items-center mt-1 mb-4">
                      <Button 
                        onClick={() => drawFileInputRef.current?.click()} 
                        variant="outline" 
                        className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
                        disabled={loading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Draw Image
                      </Button>
                      <input 
                        type="file" 
                        ref={drawFileInputRef} 
                        className="hidden"
                        accept="image/*" 
                        onChange={handleDrawFileUpload} 
                      />
                      
                      {(editingDraw?.bannerImage || newDraw.bannerImage) && (
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={handleDeleteDrawImage}
                          title="Delete image"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {(editingDraw?.bannerImage || newDraw.bannerImage) && (
                      <div className="mt-2 w-full h-40 overflow-hidden rounded-md border border-gray-200 relative group">
                        <img 
                          src={editingDraw ? editingDraw.bannerImage : newDraw.bannerImage} 
                          alt="Draw image preview" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {editingDraw && editingDraw.status === 'completed' && (
                    <div>
                      <Label htmlFor="winner">Winner (for completed draws)</Label>
                      <Input
                        id="winner"
                        name="winner"
                        value={editingDraw.winner || ''}
                        onChange={handleDrawInputChange}
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                  )}
                </div>
                
                {editingDraw ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateDraw}
                      disabled={!editingDraw.title || !editingDraw.description || loading}
                      className="flex-1 bg-gold hover:bg-gold-dark text-black"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Draw
                    </Button>
                    <Button
                      onClick={handleCancelEditDraw}
                      variant="outline"
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleCreateDraw}
                    disabled={!newDraw.title || !newDraw.description || loading}
                    className="w-full bg-gold hover:bg-gold-dark text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Draw
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-lg font-semibold mb-4">Manage Existing Draws</h2>
          
          {draws.length === 0 ? (
            <div className="p-8 text-center border rounded-lg">
              <p className="text-gray-500">No draws available. Create your first draw above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draws.map(draw => (
                <Card key={draw.id} className="overflow-hidden">
                  {draw.bannerImage && (
                    <div className="h-48 relative">
                      <img 
                        src={draw.bannerImage} 
                        alt={draw.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{draw.title}</h3>
                    <p className="text-sm mb-4 line-clamp-2">{draw.description}</p>
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDraw(draw)}
                        className="text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <div className="text-xs">
                        Status: <span className="font-semibold">{draw.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="banners">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{editingBanner ? 'Edit Banner' : 'Create New Banner'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bannerImage">Banner Image</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Button 
                      onClick={() => bannerFileInputRef.current?.click()} 
                      variant="outline" 
                      className="flex-1"
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Banner Image
                    </Button>
                    <input 
                      type="file" 
                      ref={bannerFileInputRef} 
                      className="hidden"
                      accept="image/*" 
                      onChange={handleBannerFileUpload} 
                    />
                    
                    {(editingBanner?.imageUrl || newBanner.imageUrl) && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={handleDeleteBannerImage}
                        title="Delete image"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {(editingBanner?.imageUrl || newBanner.imageUrl) && (
                    <div className="mt-4 mb-4 w-full h-40 overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={editingBanner ? editingBanner.imageUrl : newBanner.imageUrl} 
                        alt="Banner preview" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    placeholder="https://example.com"
                    value={editingBanner ? editingBanner.linkUrl : newBanner.linkUrl}
                    onChange={handleBannerInputChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Where users will be directed when they click the banner.</p>
                </div>
                
                {editingBanner && (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="banner-active"
                      checked={editingBanner.active}
                      onCheckedChange={(checked) => {
                        setEditingBanner(prev => ({ ...prev!, active: checked }));
                      }}
                    />
                    <Label htmlFor="banner-active">Active</Label>
                  </div>
                )}
                
                {editingBanner ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateBanner}
                      disabled={!editingBanner.imageUrl || loading}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Banner
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleCreateBanner}
                    disabled={!newBanner.imageUrl || loading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Banner
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-lg font-semibold mb-4">Manage Existing Banners</h2>
          
          {banners.length === 0 ? (
            <div className="p-8 text-center border rounded-lg">
              <p className="text-gray-500">No banners available. Create your first banner above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map(banner => (
                <Card key={banner.id} className="overflow-hidden">
                  {banner.imageUrl && (
                    <div className="h-32 relative">
                      <img 
                        src={banner.imageUrl} 
                        alt="Banner" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleDeleteBanner(banner.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="truncate max-w-[70%]">
                        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate block">
                          {banner.linkUrl}
                        </a>
                      </div>
                      <Button 
                        variant={banner.active ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleToggleBannerStatus(banner)}
                        className="text-xs"
                      >
                        {banner.active ? 'Active' : 'Inactive'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search users by name or email..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" title="Filter users">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || '--'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>${user.wallet}</TableCell>
                        <TableCell>
                          {user.isAdmin ? 
                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gold/20 text-gold">Admin</span> : 
                            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">User</span>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleAdminStatus(user.id)}
                            className="h-8 text-xs"
                          >
                            {user.isAdmin ? 
                              <><UserX className="h-3 w-3 mr-1" /> Remove Admin</> : 
                              <><UserCheck className="h-3 w-3 mr-1" /> Make Admin</>
                            }
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notificationType">Notification Type</Label>
                  <Select 
                    value={notificationType} 
                    onValueChange={value => handleNotificationTypeChange(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="win">Win</SelectItem>
                      <SelectItem value="draw">Draw</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notificationMessage">Message</Label>
                  <Textarea 
                    id="notificationMessage" 
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter your notification message"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="sendToAll"
                    checked={sendToAllUsers}
                    onCheckedChange={toggleSendToAllUsers}
                  />
                  <Label htmlFor="sendToAll">Send to all users</Label>
                </div>
                
                {showUserSelector && (
                  <div>
                    <Label className="mb-2 block">Select Recipients</Label>
                    <div className="border rounded-md max-h-60 overflow-y-auto p-2">
                      {users.map(user => (
                        <div key={user.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                          <Switch 
                            id={`user-${user.id}`}
                            checked={selectedUserIds.includes(user.id)}
                            onCheckedChange={() => handleUserSelectionChange(user.id)}
                          />
                          <Label htmlFor={`user-${user.id}`} className="flex-1 flex items-center">
                            <span className="mr-2">{user.name || user.email}</span>
                            {user.isAdmin && (
                              <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">Admin</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleSendNotification}
                  disabled={!notificationMessage.trim() || (!sendToAllUsers && selectedUserIds.length === 0)}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-lg font-semibold mt-6 mb-4">Recent Notifications</h2>
          
          {notifications.length === 0 ? (
            <div className="p-8 text-center border rounded-lg">
              <p className="text-gray-500">No notifications have been sent yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.slice(0, 5).map(notification => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {notification.type === 'system' && <Bell className="h-5 w-5 text-blue-500" />}
                        {notification.type === 'win' && <Check className="h-5 w-5 text-green-500" />}
                        {notification.type === 'draw' && <Calendar className="h-5 w-5 text-gold" />}
                        {notification.type === 'promotion' && <DollarSign className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1">{notification.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="media">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Upload Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline" 
                    className="w-full h-24 flex flex-col items-center justify-center border-dashed"
                    disabled={loading}
                  >
                    <Upload className="h-8 w-8 mb-2" />
                    <span>Click to upload image</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden"
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-lg font-semibold mb-4">Media Library</h2>
          
          {media.length === 0 ? (
            <div className="p-8 text-center border rounded-lg">
              <p className="text-gray-500">No media available. Upload your first image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map(item => (
                <div key={item.id} className="group relative border rounded-md overflow-hidden">
                  <AspectRatio ratio={1}>
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="object-cover w-full h-full" 
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        toast({ 
                          title: "URL copied", 
                          description: "Image URL copied to clipboard" 
                        });
                      }}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => deleteMedia(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Background Image</Label>
                  <div className="flex gap-2 items-center">
                    <Button 
                      onClick={() => bgImageFileInputRef.current?.click()} 
                      variant="outline" 
                      className="flex-1"
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Background Image
                    </Button>
                    <input 
                      type="file" 
                      ref={bgImageFileInputRef} 
                      className="hidden"
                      accept="image/*" 
                      onChange={handleBgImageFileUpload} 
                    />
                  </div>
                  
                  {authBackgroundImage && (
                    <div className="mt-4 mb-4 border rounded-md overflow-hidden">
                      <AspectRatio ratio={16/9}>
                        <img 
                          src={authBackgroundImage} 
                          alt="Background preview" 
                          className="w-full h-full object-cover" 
                        />
                      </AspectRatio>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="fontFamily" className="mb-2 block">Font Family</Label>
                  <Select value={fontFamily} onValueChange={handleFontChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontsList.map(font => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="mb-2 block">Primary Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor" className="mb-2 block">Secondary Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="backgroundColor" className="mb-2 block">Background Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: backgroundColor }}
                      />
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={saveAppearanceSettings}
                    disabled={!appearanceChanged}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Appearance Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
