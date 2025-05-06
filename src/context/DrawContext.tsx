import React, { createContext, useState, useContext, useEffect } from 'react';
import { Draw, Ticket, Notification, MediaItem, Banner } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { getMediaItems, uploadToS3, deleteFromS3, BucketType } from '@/utils/s3Utils';

interface DrawContextType {
  draws: Draw[];
  tickets: Ticket[];
  notifications: Notification[];
  media: MediaItem[];
  banners: Banner[];
  loading: boolean;
  error: string | null;
  fetchDraws: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  createDraw: (draw: Omit<Draw, 'id'>) => Promise<void>;
  updateDraw: (id: string, updates: Partial<Draw>) => Promise<void>;
  deleteDraw: (id: string) => Promise<void>;
  buyTicket: (drawId: string, quantity: number) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  uploadMedia: (file: File, bucketType?: BucketType) => Promise<MediaItem>;
  deleteMedia: (id: string, bucketType?: BucketType) => Promise<void>;
  // Banner management functions
  createBanner: (banner: Omit<Banner, 'id'>) => Promise<Banner>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  fetchBanners: () => Promise<void>;
}

export const DrawContext = createContext<DrawContextType>({
  draws: [],
  tickets: [],
  notifications: [],
  media: [],
  banners: [],
  loading: false,
  error: null,
  fetchDraws: async () => {},
  fetchTickets: async () => {},
  fetchNotifications: async () => {},
  createDraw: async () => {},
  updateDraw: async () => {},
  deleteDraw: async () => {},
  buyTicket: async () => {},
  markNotificationAsRead: async () => {},
  uploadMedia: async () => ({ id: '', name: '', url: '', type: 'image', size: 0, user_id: '', uploadDate: '' }),
  deleteMedia: async () => {},
  createBanner: async () => ({ id: '', imageUrl: '', linkUrl: '', active: true }),
  updateBanner: async () => {},
  deleteBanner: async () => {},
  fetchBanners: async () => {},
});

interface DrawProviderProps {
  children: React.ReactNode;
}

export const DrawProvider: React.FC<DrawProviderProps> = ({ children }) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDraws();
      fetchTickets();
      fetchNotifications();
      fetchBanners();
      loadMedia();
    }
  }, [user]);

  // Mock function for fetching draws since table doesn't exist in DB yet
  const fetchDraws = async () => {
    setLoading(true);
    try {
      // For development, we'll use a mock response until the draws table is created
      setDraws([
        {
          id: '1',
          title: 'Weekly Draw',
          description: 'Win amazing prizes in our weekly lottery draw',
          maxParticipants: 100,
          currentParticipants: 45,
          ticketPrices: [5, 10, 20],
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error fetching draws:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to load draws',
        description: 'An unexpected error occurred while loading the draws.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock function for fetching tickets since table doesn't exist in DB yet
  const fetchTickets = async () => {
    setLoading(true);
    try {
      // For development, we'll use a mock response until the tickets table is created
      setTickets([
        {
          id: '1',
          drawId: '1',
          userId: user?.id || '',
          number: 12345,
          price: 10,
          purchaseDate: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error fetching tickets:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to load tickets',
        description: 'An unexpected error occurred while loading your tickets.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error('Error fetching notifications:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load notifications',
          description: 'There was an error loading your notifications. Please try again later.'
        });
      } else if (data) {
        // Map DB fields to our interface
        const mappedNotifications: Notification[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          message: item.message,
          read: item.read,
          type: item.type as 'win' | 'draw' | 'system' | 'promotion',
          createdAt: item.created_at,
          toAll: false
        }));
        setNotifications(mappedNotifications);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error fetching notifications:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to load notifications',
        description: 'An unexpected error occurred while loading your notifications.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock function for creating draws since table doesn't exist in DB yet
  const createDraw = async (draw: Omit<Draw, 'id'>) => {
    setLoading(true);
    try {
      // Mock the create draw functionality for now
      const newDraw = { 
        id: Math.random().toString(), 
        ...draw 
      };
      setDraws([...draws, newDraw]);
      toast({
        title: 'Draw created',
        description: `${draw.title} has been created successfully.`
      });
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error creating draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to create draw',
        description: 'An unexpected error occurred while creating the draw.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock function for updating draws since table doesn't exist in DB yet
  const updateDraw = async (id: string, updates: Partial<Draw>) => {
    setLoading(true);
    try {
      // Mock update draw functionality
      setDraws(draws.map(draw => (draw.id === id ? { ...draw, ...updates } : draw)));
      toast({
        title: 'Draw updated',
        description: `${updates.title || 'Draw'} has been updated successfully.`
      });
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error updating draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to update draw',
        description: 'An unexpected error occurred while updating the draw.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock function for deleting draws since table doesn't exist in DB yet
  const deleteDraw = async (id: string) => {
    setLoading(true);
    try {
      // Mock delete draw functionality
      setDraws(draws.filter(draw => draw.id !== id));
      toast({
        title: 'Draw deleted',
        description: 'The draw has been deleted successfully.'
      });
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error deleting draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to delete draw',
        description: 'An unexpected error occurred while deleting the draw.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock function for buying tickets since table doesn't exist in DB yet
  const buyTicket = async (drawId: string, quantity: number) => {
    setLoading(true);
    try {
      // Mock buy ticket functionality
      const draw = draws.find(d => d.id === drawId);
      if (!draw) {
        throw new Error('Draw not found');
      }

      const ticketPrice = draw.ticketPrices[0]; // Assuming the first price in the array
      
      // Generate new tickets
      const newTickets = Array(quantity).fill(null).map(() => ({
        id: Math.random().toString(),
        drawId: drawId,
        userId: user?.id || '',
        number: Math.floor(Math.random() * 1000000),
        price: ticketPrice,
        purchaseDate: new Date().toISOString()
      }));
      
      setTickets([...tickets, ...newTickets]);
      toast({
        title: 'Ticket purchased',
        description: `You have purchased ${quantity} tickets for ${draw.title}.`,
      });
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error buying ticket:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to buy ticket',
        description: 'An unexpected error occurred while buying the ticket.'
      });
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to mark notification as read',
          description: 'There was an error marking the notification as read. Please try again later.'
        });
      } else {
        setNotifications(notifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        ));
      }
    } catch (err) {
      console.error('Unexpected error marking notification as read:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to mark notification as read',
        description: 'An unexpected error occurred while marking the notification as read.'
      });
    }
  };

  // Implement banner management functions 
  const fetchBanners = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        throw error;
      }

      // Map database fields to our Banner interface
      const fetchedBanners = data.map((banner) => ({
        id: banner.id,
        imageUrl: banner.image_url,
        linkUrl: banner.link_url || '/draws',
        title: banner.title || '',
        active: banner.active,
        position: banner.position
      }));

      setBanners(fetchedBanners);
      console.log('Fetched banners:', fetchedBanners.length);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to fetch banners',
        description: 'There was a problem fetching the banners.',
      });
    }
  };

  const createBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner> => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert({
          image_url: banner.imageUrl,
          link_url: banner.linkUrl,
          title: banner.title,
          active: banner.active,
          position: banner.position
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Map the database response to our Banner interface
      const newBanner: Banner = {
        id: data.id,
        imageUrl: data.image_url,
        linkUrl: data.link_url || '/draws',
        title: data.title || '',
        active: data.active,
        position: data.position
      };

      // Update the banners state with the new banner
      setBanners(prev => [...prev, newBanner]);

      toast({
        title: 'Banner created',
        description: 'The banner has been successfully created.',
      });

      return newBanner;
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create banner',
        description: 'There was a problem creating the banner.',
      });
      throw error;
    }
  };

  const updateBanner = async (id: string, banner: Partial<Banner>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({
          image_url: banner.imageUrl,
          link_url: banner.linkUrl,
          title: banner.title,
          active: banner.active,
          position: banner.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the banners state
      setBanners(prev => prev.map(b => 
        b.id === id ? { ...b, ...banner } : b
      ));

      toast({
        title: 'Banner updated',
        description: 'The banner has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update banner',
        description: 'There was a problem updating the banner.',
      });
      throw error;
    }
  };

  const deleteBanner = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the banners state
      setBanners(prev => prev.filter(b => b.id !== id));

      toast({
        title: 'Banner deleted',
        description: 'The banner has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete banner',
        description: 'There was a problem deleting the banner.',
      });
      throw error;
    }
  };

  // Update the loadMedia function:
  const loadMedia = async (): Promise<void> => {
    if (!user) {
      console.log('No user, not loading media');
      return;
    }
    
    setLoading(true);
    
    try {
      const mediaItems = await getMediaItems();
      
      // Transform items to match MediaItem interface
      const formattedItems: MediaItem[] = mediaItems.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: validateMediaType(item.type),
        size: item.size || 0,
        user_id: item.user_id || user.id || '',
        uploadDate: item.uploadDate || new Date().toISOString()
      }));
      
      setMedia(formattedItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load media',
        description: 'There was an error loading your media files.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate media type
  const validateMediaType = (type: any): "image" | "document" | "video" => {
    if (type === 'image' || type === 'document' || type === 'video') {
      return type as "image" | "document" | "video";
    }
    
    // Default to the most appropriate type based on the string
    if (typeof type === 'string') {
      if (type.includes('image')) return 'image';
      if (type.includes('document')) return 'document';
      if (type.includes('video')) return 'video';
    }
    
    // Fallback to 'document' as default
    return 'document';
  };

  // Update the uploadMedia function to include user_id
  const uploadMedia = async (file: File, bucketType: BucketType = 'draw_images'): Promise<MediaItem> => {
    if (!user) {
      console.error('No user, cannot upload media');
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'You must be logged in to upload media.'
      });
      throw new Error('Not authenticated');
    }
    
    setLoading(true);
    try {
      const determineMediaType = (fileName: string): "image" | "document" | "video" => {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
      
        if (imageExtensions.includes(extension)) return 'image';
        if (videoExtensions.includes(extension)) return 'video';
        return 'document';
      };
      
      const mediaType = determineMediaType(file.name);
      
      const uploadResult = await uploadToS3(file, bucketType);
      
      const newItem: MediaItem = {
        id: uploadResult.key,
        name: uploadResult.name,
        url: uploadResult.url,
        type: mediaType,
        size: uploadResult.size,
        user_id: user?.id || '',
        uploadDate: new Date().toISOString(),
      };

      setMedia([newItem, ...media]);
      toast({
        title: 'Media uploaded',
        description: `${file.name} has been uploaded successfully.`
      });
      return newItem;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your media file.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id: string, bucketType: BucketType = 'draw_images'): Promise<void> => {
    setLoading(true);
    try {
      await deleteFromS3(id, bucketType);
      setMedia(media.filter(item => item.id !== id));
      toast({
        title: 'Media deleted',
        description: 'The media file has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: 'There was an error deleting the media file.'
      });
    } finally {
      setLoading(false);
    }
  };

  const value: DrawContextType = {
    draws,
    tickets,
    notifications,
    media,
    banners,
    loading,
    error,
    fetchDraws,
    fetchTickets,
    fetchNotifications,
    createDraw,
    updateDraw,
    deleteDraw,
    buyTicket,
    markNotificationAsRead,
    uploadMedia,
    deleteMedia,
    createBanner,
    updateBanner,
    deleteBanner,
    fetchBanners
  };

  return (
    <DrawContext.Provider value={value}>
      {children}
    </DrawContext.Provider>
  );
};

const useDraws = () => {
  const context = useContext(DrawContext);
  if (context === undefined) {
    throw new Error('useDraws must be used within a DrawProvider');
  }
  return context;
};

export { DrawProvider, useDraws };
