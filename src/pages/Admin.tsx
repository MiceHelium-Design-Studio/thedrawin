
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
  Users, UserCheck, UserX, Search, Filter, Bell, BellRing, MessageSquare, Send 
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
  const { draws, banners, createDraw, updateDraw, createBanner, updateBanner, uploadMedia, loading } = useDraws();
  const { authBackgroundImage, setAuthBackgroundImage } = useBackground();
  const { sendNotification, notifications } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const handleDrawInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDraw(prev => ({ ...prev, [name]: value }));
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
      
      // Reset form
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
              <CardTitle className="text-lg">Create New Draw</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={newDraw.title}
                      onChange={handleDrawInputChange}
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newDraw.description}
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
                        value={newDraw.maxParticipants}
                        onChange={handleDrawInputChange}
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ticketPrices">Ticket Prices (comma separated)</Label>
                      <Input
                        id="ticketPrices"
                        value={newDraw.ticketPrices.join(', ')}
                        onChange={handleTicketPriceChange}
                        placeholder="5, 10, 20"
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
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
                          value={new Date(newDraw.startDate).toISOString().split('T')[0]}
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
                          value={new Date(newDraw.endDate).toISOString().split('T')[0]}
                          onChange={handleDrawInputChange}
                          className="pl-10 border-gold/30 focus:border-gold"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bannerImage">Banner Image URL (optional)</Label>
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="bannerImage"
                        name="bannerImage"
                        value={newDraw.bannerImage || ''}
                        onChange={handleDrawInputChange}
                        className="pl-10 border-gold/30 focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleCreateDraw}
                  disabled={!newDraw.title || !newDraw.description || loading}
                  className="w-full bg-gold hover:bg-gold-dark text-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Draw
                </Button>
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
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{draw.title}</h3>
                        <p className="text-sm text-gray-500">
                          Status: {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {draw.status === 'upcoming' && (
                          <Button
                            onClick={() => updateDraw(draw.id, { status: 'active' })}
                            variant="outline"
                            size="sm"
                            className="text-xs border-green-500 text-green-500 hover:bg-green-50"
                          >
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
                      className="w-full border-gold/30 text-gold hover:bg-gold/10"
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
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={editingBanner ? editingBanner.imageUrl : newBanner.imageUrl}
                      onChange={handleBannerInputChange}
                      className="pl-10 border-gold/30 focus:border-gold"
                      placeholder="Image URL will appear here after upload"
                    />
                  </div>
                  {(editingBanner?.imageUrl || newBanner.imageUrl) && (
                    <div className="mt-2 w-full max-h-40 overflow-hidden rounded border border-gray-200">
                      <img 
                        src={editingBanner ? editingBanner.imageUrl : newBanner.imageUrl} 
                        alt="Banner preview" 
                        className="w-full object-cover" 
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    value={editingBanner ? editingBanner.linkUrl : newBanner.linkUrl}
                    onChange={handleBannerInputChange}
                    className="border-gold/30 focus:border-gold"
                  />
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
                    Add Banner
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-lg font-semibold mb-4">Manage Banners</h2>
          
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
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                        <img
                          src={banner.imageUrl}
                          alt="Banner"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Link URL:</p>
                        <p className="text-sm mb-3 truncate">{banner.linkUrl}</p>
                        
                        <div className="flex gap-2">
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
                            {banner.active ? 'Disable' : 'Enable'}
                          </Button>
                          
                          <Button
                            onClick={() => handleEditBanner(banner)}
                            variant="outline"
                            size="sm"
                            className="text-xs border-gold/30 text-gold hover:bg-gold/10"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
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
              <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gold/30 focus:border-gold"
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gold/10 flex items-center justify-center">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Users className="h-5 w-5 text-gold/70" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{user.name || 'Anonymous'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-gold/70" />
                              {user.wallet}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={user.isAdmin} 
                                onCheckedChange={() => toggleAdminStatus(user.id)}
                                className={user.isAdmin ? "bg-gold" : ""}
                              />
                              <span>{user.isAdmin ? 'Admin' : 'User'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAdminStatus(user.id)}
                              className="h-8 w-8 p-0 text-gold hover:text-gold-light"
                            >
                              {user.isAdmin ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {user.isAdmin ? 'Remove admin rights' : 'Make admin'}
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Push Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Notification Message</Label>
                  <Textarea
                    id="message"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter your notification message..."
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={notificationType}
                    onValueChange={handleNotificationTypeChange}
                  >
                    <SelectTrigger className="border-gold/30 focus:border-gold">
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-blue-500" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="draw">
                        <div className="flex items-center">
                          <BellRing className="h-4 w-4 mr-2 text-green-500" />
                          <span>Draw</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="promotion">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gold" />
                          <span>Promotion</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="sendToAll"
                    checked={sendToAllUsers}
                    onCheckedChange={toggleSendToAllUsers}
                    className={sendToAllUsers ? "bg-gold" : ""}
                  />
                  <Label htmlFor="sendToAll">Send to all users</Label>
                </div>
                
                {showUserSelector && (
                  <div>
                    <Label className="mb-2 block">Select recipients</Label>
                    <div className="mb-2 flex justify-between">
                      <p className="text-sm text-gray-500">
                        {selectedUserIds.length} users selected
                      </p>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gold/30 text-gold hover:bg-gold/10"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Select Users
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select Recipients</DialogTitle>
                            <DialogDescription>
                              Choose which users will receive this notification.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="max-h-80 overflow-y-auto py-4">
                            <div className="space-y-2">
                              {users.map(user => (
                                <div key={user.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`user-${user.id}`}
                                    checked={selectedUserIds.includes(user.id)}
                                    onChange={() => handleUserSelectionChange(user.id)}
                                    className="h-4 w-4 text-gold rounded border-gold/30 focus:ring-gold/30"
                                  />
                                  <label htmlFor={`user-${user.id}`} className="text-sm flex items-center space-x-2">
                                    <div className="h-6 w-6 rounded-full overflow-hidden bg-gold/10">
                                      {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <Users className="h-4 w-4 text-gold/70" />
                                      )}
                                    </div>
                                    <span>{user.name || user.email}</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDialogOpen(false)}
                              className="border-gold/30 text-gold hover:bg-gold/10"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => setDialogOpen(false)}
                              className="bg-gold hover:bg-gold-dark text-black"
                            >
                              Confirm
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleSendNotification}
                  disabled={!notificationMessage.trim() || (showUserSelector && selectedUserIds.length === 0)}
                  className="w-full bg-gold hover:bg-gold-dark text-black"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="media">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Media Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex-1 bg-gold hover:bg-gold-dark text-black"
                    disabled={loading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Media
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden"
                    accept="image/*,video/*,application/pdf" 
                    onChange={handleFileChange} 
                  />
                  
                  <Button 
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-3">Login Background Image</h3>
                  <div className="mb-4">
                    <Button 
                      onClick={() => bgImageFileInputRef.current?.click()} 
                      variant="outline" 
                      className="border-gold/30 text-gold hover:bg-gold/10 mb-4"
                      disabled={loading}
                    >
                      <PaintBucket className="h-4 w-4 mr-2" />
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
                    <div className="rounded-lg overflow-hidden border border-gray-200 mb-3 relative group">
                      <img 
                        src={authBackgroundImage} 
                        alt="Auth background" 
                        className="w-full h-48 object-cover" 
                      />
                    </div>
                  )}
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
