import React, { createContext, useState, useContext, useEffect } from 'react';
import { Draw, Ticket, Notification, MediaItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { getMediaItems, uploadToS3, deleteFromS3, BucketType } from '@/utils/s3Utils';

interface DrawContextType {
  draws: Draw[];
  tickets: Ticket[];
  notifications: Notification[];
  media: MediaItem[];
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
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

interface DrawProviderProps {
  children: React.ReactNode;
}

const DrawProvider: React.FC<DrawProviderProps> = ({ children }) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDraws();
      fetchTickets();
      fetchNotifications();
      loadMedia();
    }
  }, [user]);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('startDate', { ascending: true });

      if (error) {
        setError(error.message);
        console.error('Error fetching draws:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load draws',
          description: 'There was an error loading the draws. Please try again later.'
        });
      } else {
        setDraws(data || []);
      }
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

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('userId', user?.id);

      if (error) {
        setError(error.message);
        console.error('Error fetching tickets:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load tickets',
          description: 'There was an error loading your tickets. Please try again later.'
        });
      } else {
        setTickets(data || []);
      }
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
        .eq('userId', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error('Error fetching notifications:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load notifications',
          description: 'There was an error loading your notifications. Please try again later.'
        });
      } else {
        setNotifications(data || []);
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

  const createDraw = async (draw: Omit<Draw, 'id'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('draws')
        .insert([draw]);

      if (error) {
        setError(error.message);
        console.error('Error creating draw:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to create draw',
          description: 'There was an error creating the draw. Please try again later.'
        });
      } else {
        setDraws([...draws, { id: data[0].id, ...draw }]);
        toast({
          title: 'Draw created',
          description: `${draw.title} has been created successfully.`
        });
      }
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

  const updateDraw = async (id: string, updates: Partial<Draw>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('draws')
        .update(updates)
        .eq('id', id);

      if (error) {
        setError(error.message);
        console.error('Error updating draw:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to update draw',
          description: 'There was an error updating the draw. Please try again later.'
        });
      } else {
        setDraws(draws.map(draw => (draw.id === id ? { ...draw, ...updates } : draw)));
        toast({
          title: 'Draw updated',
          description: `${updates.title || 'Draw'} has been updated successfully.`
        });
      }
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

  const deleteDraw = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('draws')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
        console.error('Error deleting draw:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to delete draw',
          description: 'There was an error deleting the draw. Please try again later.'
        });
      } else {
        setDraws(draws.filter(draw => draw.id !== id));
        toast({
          title: 'Draw deleted',
          description: 'The draw has been deleted successfully.'
        });
      }
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

  const buyTicket = async (drawId: string, quantity: number) => {
    setLoading(true);
    try {
      // Fetch the draw details to get the ticket price
      const { data: drawData, error: drawError } = await supabase
        .from('draws')
        .select('*')
        .eq('id', drawId)
        .single();

      if (drawError) {
        setError(drawError.message);
        console.error('Error fetching draw:', drawError);
        toast({
          variant: 'destructive',
          title: 'Failed to buy ticket',
          description: 'There was an error fetching the draw details. Please try again later.'
        });
        return;
      }

      if (!drawData) {
        setError('Draw not found.');
        toast({
          variant: 'destructive',
          title: 'Failed to buy ticket',
          description: 'The draw was not found.'
        });
        return;
      }

      const ticketPrice = drawData.ticketPrices[0]; // Assuming the first price in the array
      const totalPrice = ticketPrice * quantity;

      // Check if the user has enough balance
      if (!user || user.wallet < totalPrice) {
        setError('Insufficient balance.');
        toast({
          variant: 'destructive',
          title: 'Failed to buy ticket',
          description: 'Insufficient balance. Please add funds to your wallet.'
        });
        return;
      }

      // Generate ticket numbers
      const newTickets: Omit<Ticket, 'id' | 'purchaseDate'>[] = Array(quantity).fill(null).map(() => ({
        drawId: drawId,
        userId: user.id,
        number: Math.floor(Math.random() * 1000000), // Generate a random ticket number
        price: ticketPrice,
      }));

      // Insert the new tickets
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert(newTickets)
        .select('*'); // Select all columns to get the IDs of the newly inserted tickets

      if (ticketError) {
        setError(ticketError.message);
        console.error('Error buying ticket:', ticketError);
        toast({
          variant: 'destructive',
          title: 'Failed to buy ticket',
          description: 'There was an error buying the ticket. Please try again later.'
        });
        return;
      }

      // Update the user's wallet
      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet: user.wallet - totalPrice })
        .eq('id', user.id);

      if (walletError) {
        setError(walletError.message);
        console.error('Error updating wallet:', walletError);
        toast({
          variant: 'destructive',
          title: 'Failed to buy ticket',
          description: 'There was an error updating your wallet. Please try again later.'
        });
        return;
      }

      // Update the local state
      setTickets([...tickets, ...ticketData]);
      // Update user context
      //updateUser({ ...user, wallet: user.wallet - totalPrice });

      toast({
        title: 'Ticket purchased',
        description: `You have purchased ${quantity} tickets for ${drawData.title}.`,
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

// within the DrawProvider component, update the loadMedia function:

const loadMedia = async () => {
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

  const deleteMedia = async (id: string, bucketType: BucketType = 'draw_images') => {
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
    deleteMedia
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
