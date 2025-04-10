import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Plus, DollarSign, Calendar, Upload, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDraws } from '../context/DrawContext';
import { useToast } from '@/components/ui/use-toast';
import { Draw, Banner } from '../types';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { draws, banners, createDraw, updateDraw, createBanner, updateBanner, uploadMedia, loading } = useDraws();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newDraw, setNewDraw] = useState<Omit<Draw, 'id'>>({
    title: '',
    description: '',
    maxParticipants: 100,
    currentParticipants: 0,
    ticketPrices: [5, 10, 20],
    status: 'upcoming',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
  });
  
  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id'>>({
    imageUrl: '',
    linkUrl: '',
    active: true,
  });
  
  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

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
    setNewBanner(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTicketPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prices = value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    setNewDraw(prev => ({ ...prev, ticketPrices: prices }));
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="draws">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="draws">Draws</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        
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
              <CardTitle className="text-lg">Add New Banner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={newBanner.imageUrl}
                      onChange={handleBannerInputChange}
                      className="pl-10 border-gold/30 focus:border-gold"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    value={newBanner.linkUrl}
                    onChange={handleBannerInputChange}
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                
                <Button
                  onClick={handleCreateBanner}
                  disabled={!newBanner.imageUrl || !newBanner.linkUrl || loading}
                  className="w-full bg-gold hover:bg-gold-dark text-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Banner
                </Button>
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
                        </div>
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
              <CardTitle className="text-lg">Media Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Upload Image File</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button 
                          onClick={() => fileInputRef.current?.click()} 
                          className="w-full bg-gold hover:bg-gold-dark text-black"
                          disabled={loading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image File
                        </Button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden"
                          accept="image/*" 
                          onChange={handleFileChange} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Media Library</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm">
                          Access the full media library with more advanced features for managing your media files.
                        </p>
                        <Button 
                          onClick={() => navigate('/media')}
                          variant="outline"
                          className="w-full border-gold/30 text-gold hover:bg-gold/10"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Open Media Library
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
