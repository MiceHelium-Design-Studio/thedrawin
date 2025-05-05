import React, { createContext, useContext, useState, useEffect } from 'react';
import { Draw, Ticket, Banner, MediaItem } from '../types';
import { sendDrawEntryNotifications } from '../utils/notificationUtils';
import { useAuth } from './AuthContext';
import { getMediaItems, uploadToS3, deleteFromS3, BucketType } from '../utils/s3Utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { initializeGoldBanner } from '../utils/bannerUtils';

const MOCK_DRAWS: Draw[] = [
  {
    id: '1',
    title: 'Weekend Gold Coin Rush',
    description: 'Win a 24K gold coin worth $1,500. Drawing this Sunday!',
    maxParticipants: 100,
    currentParticipants: 45,
    ticketPrices: [5, 10, 20],
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    bannerImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'VIP Gold Coin Draw',
    description: 'Exclusive draw for a rare collector\'s gold coin.',
    maxParticipants: 50,
    currentParticipants: 12,
    ticketPrices: [20],
    status: 'upcoming',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    bannerImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Last Week\'s Gold Rush',
    description: 'Congratulations to our winner!',
    maxParticipants: 100,
    currentParticipants: 100,
    ticketPrices: [5, 10],
    status: 'completed',
    startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    winner: 'John D.',
    bannerImage: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&auto=format&fit=crop',
  }
];

const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1200&auto=format&fit=crop',
    linkUrl: 'https://example.com',
    active: true
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&auto=format&fit=crop',
    linkUrl: 'https://example.com/promo',
    active: true
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop',
    linkUrl: 'https://example.com/special',
    active: true
  }
];

interface DrawContextType {
  draws: Draw[];
  tickets: Ticket[];
  banners: Banner[];
  media: MediaItem[];
  loading: boolean;
  createDraw: (draw: Omit<Draw, 'id'>) => Promise<void>;
  updateDraw: (id: string, draw: Partial<Draw>) => Promise<void>;
  deleteDraw: (id: string) => Promise<void>;
  buyTicket: (drawId: string, number: number, price: number) => Promise<void>;
  createBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  uploadMedia: (file: File, bucketType: BucketType) => Promise<MediaItem>;
  deleteMedia: (id: string, bucketType: BucketType) => Promise<void>;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

export const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("DrawProvider initializing...");
  
  const [draws, setDraws] = useState<Draw[]>(MOCK_DRAWS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchMediaItems();
      
      const channel = supabase
        .channel('media-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'media_items',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as any;
              setMedia(prevMedia => {
                const exists = prevMedia.some(item => item.id === newItem.id);
                if (exists) return prevMedia;
                
                let mediaType: "image" | "document" | "video" = "document";
                if (newItem.type === 'image' || newItem.type === 'document' || newItem.type === 'video') {
                  mediaType = newItem.type;
                } else if (newItem.type.includes('image')) {
                  mediaType = 'image';
                } else if (newItem.type.includes('video')) {
                  mediaType = 'video';
                }
                
                const mediaItem: MediaItem = {
                  id: newItem.id,
                  name: newItem.name,
                  url: newItem.url,
                  type: mediaType,
                  size: newItem.size || 0,
                  user_id: newItem.user_id || user.id,
                  uploadDate: newItem.upload_date || new Date().toISOString()
                };
                
                return [...prevMedia, mediaItem];
              });
              
              toast({
                title: "Media uploaded",
                description: `${newItem.name} has been added to your library.`
              });
            } 
            else if (payload.eventType === 'DELETE') {
              setMedia(prevMedia => 
                prevMedia.filter(item => item.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  const fetchMediaItems = async () => {
    if (!user) return;
    
    try {
      const mediaItems = await getMediaItems();
      
      // Transform items to match MediaItem interface
      const formattedItems: MediaItem[] = mediaItems.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: validateMediaType(item.type),
        size: item.size || 0,
        user_id: item.user_id || user.id,
        uploadDate: item.uploadDate || item.upload_date || new Date().toISOString()
      }));
      
      setMedia(formattedItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load media',
        description: 'There was a problem loading your media library.'
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

  useEffect(() => {
    console.log("DrawContext initializing...");
    
    initializeGoldBanner().catch(error => {
      console.error("Error initializing banner:", error);
    });
    
    const timer = setTimeout(() => {
      console.log("DrawContext loading completed");
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const createDraw = async (draw: Omit<Draw, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newDraw: Draw = {
        ...draw,
        id: Date.now().toString(),
      };
      setDraws(prev => [...prev, newDraw]);
    } catch (error) {
      console.error('Create draw error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDraw = async (id: string, drawData: Partial<Draw>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDraws(prev =>
        prev.map(draw => (draw.id === id ? { ...draw, ...drawData } : draw))
      );
    } catch (error) {
      console.error('Update draw error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDraw = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDraws(prev => prev.filter(draw => draw.id !== id));
    } catch (error) {
      console.error('Delete draw error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const buyTicket = async (drawId: string, number: number, price: number) => {
    setLoading(true);
    try {
      const draw = draws.find(d => d.id === drawId);
      if (!draw) {
        throw new Error('Draw not found');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTicket: Ticket = {
        id: Date.now().toString(),
        drawId,
        userId: user?.id || '1',
        number,
        price,
        purchaseDate: new Date().toISOString(),
      };
      setTickets(prev => [...prev, newTicket]);
      
      setDraws(prev =>
        prev.map(draw =>
          draw.id === drawId
            ? { ...draw, currentParticipants: draw.currentParticipants + 1 }
            : draw
        )
      );
      
      if (user?.id) {
        await sendDrawEntryNotifications(user.id, draw.title, number, price);
      }
    } catch (error) {
      console.error('Buy ticket error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (banner: Omit<Banner, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newBanner: Banner = {
        ...banner,
        id: Date.now().toString(),
      };
      setBanners(prev => [...prev, newBanner]);
    } catch (error) {
      console.error('Create banner error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (id: string, bannerData: Partial<Banner>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBanners(prev =>
        prev.map(banner => (banner.id === id ? { ...banner, ...bannerData } : banner))
      );
    } catch (error) {
      console.error('Update banner error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteBanner = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBanners(prev => prev.filter(banner => banner.id !== id));
    } catch (error) {
      console.error('Delete banner error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async (file: File, bucketType: BucketType = 'media'): Promise<MediaItem> => {
    setLoading(true);
    try {
      const { url, key, name, size, type } = await uploadToS3(file, bucketType);
      
      let mediaType: "image" | "document" | "video" = "document";
      if (type === 'image' || type === 'document' || type === 'video') {
        mediaType = type as "image" | "document" | "video";
      } else if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      }
      
      const newMedia: MediaItem = {
        id: key,
        name: name,
        url: url,
        type: mediaType,
        size: size,
        user_id: user?.id || '',
        uploadDate: new Date().toISOString(),
      };
      
      setMedia(prev => {
        const exists = prev.some(item => item.id === newMedia.id);
        if (exists) return prev;
        return [...prev, newMedia];
      });
      
      return newMedia;
    } catch (error) {
      console.error('Upload media error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id: string, bucketType: BucketType = 'media'): Promise<void> => {
    setLoading(true);
    try {
      await deleteFromS3(id, bucketType);
      
      setMedia(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete media error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawContext.Provider
      value={{
        draws,
        tickets,
        banners,
        media,
        loading,
        createDraw,
        updateDraw,
        deleteDraw,
        buyTicket,
        createBanner,
        updateBanner,
        deleteBanner,
        uploadMedia,
        deleteMedia
      }}
    >
      {children}
    </DrawContext.Provider>
  );
};

export const useDraws = () => {
  console.log("useDraws hook called");
  const context = useContext(DrawContext);
  if (context === undefined) {
    console.error("DrawContext is undefined in useDraws hook");
    throw new Error('useDraws must be used within a DrawProvider');
  }
  return context;
};
