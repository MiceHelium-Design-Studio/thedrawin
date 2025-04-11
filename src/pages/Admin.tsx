
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
  const { user } = useAuth();
  const { draws, banners, createDraw, updateDraw, createBanner, updateBanner, deleteBanner, uploadMedia, loading } = useDraws();
  const { authBackgroundImage, setAuthBackgroundImage } = useBackground();
  const { sendNotification, notifications } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);
  const drawFileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

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
  
  const handleTicketPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const handleTicketPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prices = value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    setNewDraw(prev => ({ ...prev, ticketPrices: prices }));
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
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
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
                        onChange={handleTicketPriceChange}
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
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No draws created yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {draws.map(draw => (
                <Card key={draw.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex gap-4">
                        {draw.bannerImage && (
                          <div className="hidden sm:block w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                            <img
                              src={draw.bannerImage}
                              alt={draw.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{draw.title}</h3>
                          <p className="text-sm text-gray-500">
                            Status: {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Participants: {draw.currentParticipants}/{draw.maxParticipants}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <Button
                          onClick={() => handleEditDraw(draw)}
                          variant="outline"
                          size="sm"
                          className="text-xs border-gold/30 text-gold hover:bg-gold/10"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        
                        {draw.status === 'upcoming' && (
                          <Button
                            onClick={() => updateDraw(draw.id, { status: 'active' })}
                            variant="outline"
                            size="sm"
                            className="text-xs border-green-500 text-green-500 hover:bg-green-50"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Activate
                          </Button>
                        )}
                        
                        {draw.status === 'active' && (
                          <Button
                            onClick={() => updateDraw(draw.id, { status: 'completed' })}
                            variant="outline"
                            size="sm"
                            className="text-xs border-blue-500 text-blue-500 hover:bg-blue-50"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
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
              <CardTitle className="text-lg">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="uploadBannerImage">Upload Banner Image</Label>
                  <div className="flex gap-2 items-center mt-1 mb-4">
                    <Button 
                      onClick={() => bannerFileInputRef.current?.click()} 
                      variant="outline" 
                      className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
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
                    <div className="mt-2 w-full h-40 overflow-hidden rounded-md border border-gray-200 relative group">
                      <img 
                        src={editingBanner ? editingBanner.imageUrl : newBanner.imageUrl} 
                        alt="Banner image preview" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="linkUrl">Banner Link URL</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    value={editingBanner ? editingBanner.linkUrl : newBanner.linkUrl}
                    onChange={handleBannerInputChange}
                    placeholder="https://example.com"
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={editingBanner ? editingBanner.active : newBanner.active}
                    onCheckedChange={(checked) => {
                      if (editingBanner) {
                        setEditingBanner({
                          ...editingBanner,
                          active: checked
                        });
                      } else {
                        setNewBanner(prev => ({
                          ...prev,
                          active: checked
                        }));
                      }
                    }}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                
                {editingBanner ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateBanner}
                      disabled={!editingBanner.imageUrl || !editingBanner.linkUrl || loading}
                      className="flex-1 bg-gold hover:bg-gold-dark text-black"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Banner
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleCreateBanner}
                    disabled={!newBanner.imageUrl || !newBanner.linkUrl || loading}
                    className="w-full bg-gold hover:bg-gold-dark text-black"
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
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No banners created yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {banners.map(banner => (
                <Card key={banner.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex gap-4">
                        {banner.imageUrl && (
                          <div className="hidden sm:block w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                            <img
                              src={banner.imageUrl}
                              alt="Banner"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{banner.linkUrl}</p>
                          <p className="text-xs text-gray-500">
                            Status: {banner.active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <Button
                          onClick={() => handleEditBanner(banner)}
                          variant="outline"
                          size="sm"
                          className="text-xs border-gold/30 text-gold hover:bg-gold/10"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleToggleBannerStatus(banner)}
                          variant="outline"
                          size="sm"
                          className={`text-xs ${
                            banner.active
                              ? 'border-red-500 text-red-500 hover:bg-red-50'
                              : 'border-green-500 text-green-500 hover:bg-green-50'
                          }`}
                        >
                          {banner.active ? (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeleteBanner(banner.id)}
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 bg-background border-gold/30 focus:border-gold"
                  />
                </div>
                <Button variant="outline" className="ml-2 border-gold/30 text-gold hover:bg-gold/10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                            <img
                              src={user.avatar || 'placeholder.svg'}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1 text-gray-500" />
                          {user.wallet}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.isAdmin}
                          onCheckedChange={() => toggleAdminStatus(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="text-xs h-7 w-7">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-xs h-7 w-7">
                            <Bell className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Send Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notificationType">Notification Type</Label>
                  <Select
                    value={notificationType}
                    onValueChange={(value) => handleNotificationTypeChange(value as 'system' | 'win' | 'draw' | 'promotion')}
                  >
                    <SelectTrigger className="border-gold/30 focus:border-gold">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Message</SelectItem>
                      <SelectItem value="win">Win Notification</SelectItem>
                      <SelectItem value="draw">Draw Update</SelectItem>
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
                    placeholder="Enter your notification message..."
                    className="border-gold/30 focus:border-gold min-h-[120px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendAll"
                    checked={sendToAllUsers}
                    onCheckedChange={toggleSendToAllUsers}
                  />
                  <Label htmlFor="sendAll">Send to all users</Label>
                </div>
                
                {showUserSelector && (
                  <div>
                    <Label className="block mb-2">Select Users</Label>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                      {users.map(user => (
                        <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleUserSelectionChange(user.id)}
                            className="h-4 w-4 text-gold rounded focus:ring-gold"
                          />
                          <Label htmlFor={`user-${user.id}`} className="flex items-center">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 mr-2">
                              <img
                                src={user.avatar || 'placeholder.svg'}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span>{user.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedUserIds.length} users selected
                    </p>
                  </div>
                )}
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gold hover:bg-gold-dark text-black"
                      disabled={!notificationMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Preview and Send Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Notification</DialogTitle>
                      <DialogDescription>
                        Review your notification before sending.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="border rounded-md p-4 my-4 bg-gray-50">
                      <div className="flex items-center mb-2">
                        {notificationType === 'system' && <Bell className="h-4 w-4 mr-2 text-blue-500" />}
                        {notificationType === 'win' && <BellRing className="h-4 w-4 mr-2 text-green-500" />}
                        {notificationType === 'draw' && <Calendar className="h-4 w-4 mr-2 text-purple-500" />}
                        {notificationType === 'promotion' && <DollarSign className="h-4 w-4 mr-2 text-gold" />}
                        <span className="font-medium text-sm">
                          {notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} Notification
                        </span>
                      </div>
                      <p className="text-sm">{notificationMessage}</p>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      This will be sent to {sendToAllUsers ? 'all users' : `${selectedUserIds.length} selected users`}.
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-gold hover:bg-gold-dark text-black"
                        onClick={handleSendNotification}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
          
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No notifications sent yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        {notification.type === 'system' && <Bell className="h-4 w-4 text-blue-500" />}
                        {notification.type === 'win' && <BellRing className="h-4 w-4 text-green-500" />}
                        {notification.type === 'draw' && <Calendar className="h-4 w-4 text-purple-500" />}
                        {notification.type === 'promotion' && <DollarSign className="h-4 w-4 text-gold" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium">
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Sent to: {notification.toAll ? 'All Users' : `${notification.toUserIds?.length || 0} Users`}
                        </p>
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
              <CardTitle className="text-lg">Media Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="w-full mb-4 border-gold/30 text-gold hover:bg-gold/10"
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Media
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden"
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                
                {media.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed rounded-md">
                    <FolderOpen className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No media uploads yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Upload images to see them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {media.map(item => (
                      <div key={item.id} className="group relative border rounded-md overflow-hidden">
                        <AspectRatio ratio={1}>
                          <img 
                            src={item.url} 
                            alt={item.name} 
                            className="w-full h-full object-contain"
                          />
                        </AspectRatio>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => deleteMedia(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-2 text-xs truncate">{item.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Set the background image that appears on the authentication pages (login/register).
                </p>
                
                <div className="flex gap-2 items-center">
                  <Button 
                    onClick={() => bgImageFileInputRef.current?.click()} 
                    variant="outline" 
                    className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
                    disabled={loading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Background Image
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
                  <div className="mt-2 w-full h-40 overflow-hidden rounded-md border relative">
                    <img 
                      src={authBackgroundImage} 
                      alt="Authentication background" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2">Font</Label>
                  <Select
                    value={fontFamily}
                    onValueChange={handleFontChange}
                  >
                    <SelectTrigger className="border-gold/30 focus:border-gold">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontsList.map(font => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 p-3 border rounded-md" style={{ fontFamily }}>
                    <p>The quick brown fox jumps over the lazy dog.</p>
                    <p className="text-xs mt-1 text-gray-500">Sample text in {fontFamily}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="block mb-2">Primary Color</Label>
                    <div className="flex">
                      <div 
                        className="w-10 h-10 rounded-l-md border-t border-l border-b"
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                      <Input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="rounded-l-none border-gold/30 focus:border-gold"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">Secondary Color</Label>
                    <div className="flex">
                      <div 
                        className="w-10 h-10 rounded-l-md border-t border-l border-b"
                        style={{ backgroundColor: secondaryColor }}
                      ></div>
                      <Input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="rounded-l-none border-gold/30 focus:border-gold"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="block mb-2">Background Color</Label>
                    <div className="flex">
                      <div 
                        className="w-10 h-10 rounded-l-md border-t border-l border-b"
                        style={{ backgroundColor: backgroundColor }}
                      ></div>
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => handleColorChange('background', e.target.value)}
                        className="rounded-l-none border-gold/30 focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 border rounded-md">
                  <h3 className="text-sm font-bold mb-2">Preview</h3>
                  <div 
                    className="p-4 rounded-md"
                    style={{ backgroundColor, fontFamily }}
                  >
                    <div 
                      className="p-3 rounded-md mb-2"
                      style={{ backgroundColor: secondaryColor, color: '#fff' }}
                    >
                      <h4 className="text-sm font-bold" style={{ color: primaryColor }}>Sample Header</h4>
                      <p className="text-xs">This is how your content will look with the selected colors.</p>
                    </div>
                    <button
                      className="px-3 py-1 rounded-md text-xs text-black"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Sample Button
                    </button>
                  </div>
                </div>
                
                <Button
                  onClick={saveAppearanceSettings}
                  disabled={!appearanceChanged}
                  className="w-full bg-gold hover:bg-gold-dark text-black"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
