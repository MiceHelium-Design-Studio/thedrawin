
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  wallet: number;
  isAdmin: boolean;
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
  bannerImage?: string;
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
  imageUrl: string;
  linkUrl: string;
  active: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'other';
  size: number;
  uploadDate: string;
}
