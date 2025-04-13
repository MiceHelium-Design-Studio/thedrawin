
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Draw, Ticket, Banner, MediaItem } from '../types';
import { sendDrawEntryNotifications } from '../utils/notificationUtils';
import { useAuth } from './AuthContext';
import { getMediaItems, uploadToS3, deleteFromS3, uploadFromUrl, updateMedia } from '../utils/s3Utils';

// Mock data until we integrate with Supabase
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
  buyTicket: (drawId: string, number: number, price: number) => Promise<void>;
  createBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  uploadMedia: (file: File) => Promise<MediaItem>;
  uploadMediaFromUrl: (url: string, fileName?: string) => Promise<MediaItem>;
  updateMediaFile: (id: string, file: File) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

export const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draws, setDraws] = useState<Draw[]>(MOCK_DRAWS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const { user } = useAuth();
  
  // Load media items from S3
  useEffect(() => {
    if (user) {
      fetchMediaItems();
    }
  }, [user]);
  
  const fetchMediaItems = async () => {
    if (!user) return;
    
    try {
      const mediaItems = await getMediaItems();
      setMedia(mediaItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulate initial loading with a timeout that ensures it eventually completes
  useEffect(() => {
    console.log("DrawContext initializing...");
    
    const timer = setTimeout(() => {
      console.log("DrawContext loading completed");
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const createDraw = async (draw: Omit<Draw, 'id'>) => {
    setLoading(true);
    try {
      // Simulate API call
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
      // Simulate API call
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

  const buyTicket = async (drawId: string, number: number, price: number) => {
    setLoading(true);
    try {
      // Find the current draw
      const draw = draws.find(d => d.id === drawId);
      if (!draw) {
        throw new Error('Draw not found');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTicket: Ticket = {
        id: Date.now().toString(),
        drawId,
        userId: user?.id || '1', // Use actual user ID if available
        number,
        price,
        purchaseDate: new Date().toISOString(),
      };
      setTickets(prev => [...prev, newTicket]);
      
      // Update the draw's participant count
      setDraws(prev =>
        prev.map(draw =>
          draw.id === drawId
            ? { ...draw, currentParticipants: draw.currentParticipants + 1 }
            : draw
        )
      );
      
      // Send entry and receipt notifications if user is logged in
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
      // Simulate API call
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
      // Simulate API call
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBanners(prev => prev.filter(banner => banner.id !== id));
    } catch (error) {
      console.error('Delete banner error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async (file: File): Promise<MediaItem> => {
    setLoading(true);
    try {
      // Upload to S3
      const { url, key, name, size } = await uploadToS3(file);
      
      // Create a new media item
      const newMedia: MediaItem = {
        id: key, // Use S3 key as ID
        name: name,
        url: url,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: size,
        uploadDate: new Date().toISOString(),
      };
      
      setMedia(prev => [...prev, newMedia]);
      return newMedia;
    } catch (error) {
      console.error('Upload media error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadMediaFromUrl = async (url: string, fileName?: string): Promise<MediaItem> => {
    setLoading(true);
    try {
      // Upload from URL
      const { url: fileUrl, key, name, size, type } = await uploadFromUrl(url, fileName);
      
      // Create a new media item
      const newMedia: MediaItem = {
        id: key, // Use S3 key as ID
        name: name,
        url: fileUrl,
        type: type as 'image' | 'document' | 'other',
        size: size,
        uploadDate: new Date().toISOString(),
      };
      
      setMedia(prev => [...prev, newMedia]);
      return newMedia;
    } catch (error) {
      console.error('Upload media from URL error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMediaFile = async (id: string, file: File): Promise<MediaItem> => {
    setLoading(true);
    try {
      // Update the file in S3
      const { url, key, name, size, type } = await updateMedia(id, file);
      
      // Update the media item in state
      const updatedMedia: MediaItem = {
        id: key,
        name: name,
        url: url,
        type: type as 'image' | 'document' | 'other',
        size: size,
        uploadDate: new Date().toISOString(), // Updated timestamp
      };
      
      setMedia(prev => 
        prev.map(item => item.id === id ? updatedMedia : item)
      );
      
      return updatedMedia;
    } catch (error) {
      console.error('Update media error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Delete from S3
      await deleteFromS3(id);
      
      // Remove from state
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
        buyTicket,
        createBanner,
        updateBanner,
        deleteBanner,
        uploadMedia,
        uploadMediaFromUrl,
        updateMediaFile,
        deleteMedia
      }}
    >
      {children}
    </DrawContext.Provider>
  );
};

export const useDraws = () => {
  const context = useContext(DrawContext);
  if (context === undefined) {
    throw new Error('useDraws must be used within a DrawProvider');
  }
  return context;
};
