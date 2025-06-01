
import { Draw, Ticket, Notification, MediaItem, Banner } from '@/types';
import { BucketType } from '@/utils/s3Utils';

export interface DrawContextType {
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
  createDraw: (draw: Omit<Draw, 'id'>) => Promise<Draw>;
  updateDraw: (id: string, updates: Partial<Draw>) => Promise<void>;
  deleteDraw: (id: string) => Promise<void>;
  buyTicket: (drawId: string, ticketNumber: number, price?: number) => Promise<Ticket>;
  markNotificationAsRead: (id: string) => Promise<void>;
  uploadMedia: (file: File, bucketType?: BucketType) => Promise<MediaItem>;
  deleteMedia: (id: string, bucketType?: BucketType) => Promise<void>;
  createBanner: (banner: Omit<Banner, 'id'>) => Promise<Banner>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  fetchBanners: () => Promise<void>;
  pickWinner: (drawId: string) => Promise<any>;
}
