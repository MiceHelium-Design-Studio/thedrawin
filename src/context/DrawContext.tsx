import React, { createContext, useContext, useState } from 'react';
import { Draw, Ticket, Banner, MediaItem } from '../types';

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
    winner: 'John D.'
  }
];

const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    imageUrl: '/placeholder.svg',
    linkUrl: 'https://example.com',
    active: true
  }
];

// Mock media library data
const MOCK_MEDIA: MediaItem[] = [
  {
    id: '1',
    name: 'Gold Coin',
    url: '/placeholder.svg',
    type: 'image',
    size: 1024 * 50, // 50KB
    uploadDate: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Banner Image',
    url: '/placeholder.svg',
    type: 'image',
    size: 1024 * 120, // 120KB
    uploadDate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    name: 'Prize Photo',
    url: '/placeholder.svg',
    type: 'image',
    size: 1024 * 85, // 85KB
    uploadDate: new Date(Date.now() - 86400000 * 3).toISOString(),
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
  uploadMedia: (file: File) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

export const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draws, setDraws] = useState<Draw[]>(MOCK_DRAWS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [media, setMedia] = useState<MediaItem[]>(MOCK_MEDIA);
  const [loading, setLoading] = useState(false);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTicket: Ticket = {
        id: Date.now().toString(),
        drawId,
        userId: '1', // This would be the current user's ID
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

  const uploadMedia = async (file: File): Promise<MediaItem> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would upload to a storage solution here
      // For now, we'll create a mock URL
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        name: file.name,
        url: '/placeholder.svg', // Using placeholder as we can't really upload
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
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

  const deleteMedia = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        uploadMedia,
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
