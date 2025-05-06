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
  const ticketFunctions = useTicketFunctions(setTickets, tickets, draws);
  const notificationFunctions = useNotificationFunctions(setNotifications, notifications);
  const bannerFunctions = useBannerFunctions(setBanners, banners);
  const mediaFunctions = useMediaFunctions(setMedia, media);

  // Wrapper functions that set loading state and handle errors
  const fetchDraws = async () => {
    setLoading(true);
    setError(null);
    try {
      await drawFunctions.fetchDraws();
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      await ticketFunctions.fetchTickets(user.id);
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      await notificationFunctions.fetchNotifications(user.id);
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes
  React.useEffect(() => {
    if (user) {
      fetchDraws();
      fetchTickets();
      fetchNotifications();
      bannerFunctions.fetchBanners();
      mediaFunctions.loadMedia(user.id);
    }
  }, [user]);

  // Pass through other functions
  const { createDraw, updateDraw, deleteDraw } = drawFunctions;
  const { buyTicket } = ticketFunctions;
  const { markNotificationAsRead } = notificationFunctions;
  const { createBanner, updateBanner, deleteBanner } = bannerFunctions;

  // Define fetchBanners as a wrapper function to match the expected void return type
  const fetchBanners = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await bannerFunctions.fetchBanners();
    } catch (err) {
      setError('An unexpected error occurred.');
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
