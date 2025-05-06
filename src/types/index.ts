
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  avatar_url?: string; // Added new field for Unsplash avatar URL
  wallet: number;
  isAdmin: boolean;
  createdAt?: string;
}

export interface Draw {
  id: string;
  title: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  ticketPrices: number[];
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  winner?: string;
  bannerImage?: string; // URL to the image on Unsplash or other sources
}

export interface Ticket {
  id: string;
  drawId: string;
  userId: string;
  number: number;
  price: number;
  purchaseDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  type: 'win' | 'draw' | 'system' | 'promotion';
  createdAt: string;
  toAll?: boolean;
  toUserIds?: string[];
}

export interface Banner {
  id: string;
  imageUrl: string; // URL to the image on Unsplash or other sources
  linkUrl?: string;
  title?: string;
  active?: boolean;
  position?: number;
  url?: string; // Adding url property for compatibility
}

export interface MediaItem {
  id: string;
  name: string;
  url: string; // URL to the image on Unsplash or other sources
  type: 'image' | 'document' | 'video';
  size: number;
  user_id: string;
  uploadDate: string;
}
