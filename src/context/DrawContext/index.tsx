
import React, { createContext, useState, useContext } from 'react';
import { Draw, Ticket, Notification, MediaItem, Banner } from '@/types';
import { useAuth } from '../AuthContext';
import { BucketType } from '@/utils/s3Utils';
import { DrawContextType } from './types';
import { useMockDrawFunctions } from './drawFunctions';
import { useTicketFunctions } from './ticketFunctions';
import { useNotificationFunctions } from './notificationFunctions';
import { useBannerFunctions } from './bannerFunctions';
import { useMediaFunctions } from './mediaFunctions';

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
  createDraw: async () => ({ id: '', title: '', description: '', maxParticipants: 0, currentParticipants: 0, ticketPrices: [], status: 'upcoming', startDate: '', endDate: '' }),
  updateDraw: async () => {},
  deleteDraw: async () => {},
  buyTicket: async () => ({ id: '', drawId: '', userId: '', number: 0, price: 0, purchaseDate: '' }),
  markNotificationAsRead: async () => {},
  uploadMedia: async () => ({ id: '', name: '', url: '', type: 'image', size: 0, user_id: '', uploadDate: '' }),
  deleteMedia: async () => {},
  createBanner: async () => ({ id: '', imageUrl: '', linkUrl: '', active: true }),
  updateBanner: async () => {},
  deleteBanner: async () => {},
  fetchBanners: async () => {},
  pickWinner: async () => ({}),
});

const DrawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Import functionality from separate hook files
  const drawFunctions = useMockDrawFunctions(setDraws, draws);
  const ticketFunctions = useTicketFunctions(setTickets, tickets, draws, setDraws);
  const notificationFunctions = useNotificationFunctions(setNotifications, notifications);
  const bannerFunctions = useBannerFunctions(setBanners, banners);
  const mediaFunctions = useMediaFunctions(setMedia, media);

  // Wrapper functions that set loading state and handle errors
  const fetchDraws = async () => {
    setLoading(true);
    setError(null);
    try {
      await drawFunctions.fetchDraws();
      console.log('DrawContext: Draws fetched successfully');
    } catch (err: any) {
      console.error('DrawContext: Error fetching draws:', err);
      setError(err.message || 'Failed to load draws');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    if (!user) {
      console.log('DrawContext: No user, skipping ticket fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await ticketFunctions.fetchTickets(user.id);
      console.log('DrawContext: Tickets fetched successfully');
    } catch (err: any) {
      console.error('DrawContext: Error fetching tickets:', err);
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) {
      console.log('DrawContext: No user, skipping notifications fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await notificationFunctions.fetchNotifications(user.id);
      console.log('DrawContext: Notifications fetched successfully');
    } catch (err: any) {
      console.error('DrawContext: Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes or on initial load
  React.useEffect(() => {
    console.log('DrawContext: Effect triggered, user:', user?.id);
    
    // Always fetch draws (public data)
    fetchDraws();
    
    // Fetch banners (public data)
    bannerFunctions.fetchBanners().catch(err => {
      console.error('DrawContext: Error fetching banners:', err);
    });
    
    // Only fetch user-specific data if user is logged in
    if (user) {
      fetchTickets();
      fetchNotifications();
      mediaFunctions.loadMedia(user.id).catch(err => {
        console.error('DrawContext: Error loading media:', err);
      });
    }
  }, [user]);

  // Pass through other functions with proper return types
  const { createDraw, updateDraw, deleteDraw, pickWinner } = drawFunctions;
  const { buyTicket } = ticketFunctions;
  const { markNotificationAsRead } = notificationFunctions;
  const { createBanner, updateBanner, deleteBanner } = bannerFunctions;

  // Define fetchBanners as a wrapper function to match the expected void return type
  const fetchBanners = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await bannerFunctions.fetchBanners();
      console.log('DrawContext: Banners fetched successfully');
    } catch (err: any) {
      console.error('DrawContext: Error fetching banners:', err);
      setError(err.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  // Media functions with user ID
  const uploadMedia = async (file: File, bucketType?: BucketType): Promise<MediaItem> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    setLoading(true);
    try {
      return await mediaFunctions.uploadMedia(file, user.id, bucketType);
    } finally {
      setLoading(false);
    }
  };

  const deleteMedia = async (id: string, bucketType?: BucketType): Promise<void> => {
    setLoading(true);
    try {
      await mediaFunctions.deleteMedia(id, bucketType);
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
    fetchBanners,
    pickWinner
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
