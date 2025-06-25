
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  avatar_url?: string;
  isAdmin?: boolean;
  wallet: number;
  createdAt?: string;
}

export interface Draw {
  id: string;
  title: string;
  description: string;
  maxParticipants: number;
  currentParticipants: number;
  ticketPrices: number[];
  status: 'upcoming' | 'active' | 'completed' | 'open';
  startDate: string;
  endDate: string;
  winner?: string;
  numberOfTickets?: number;
  bannerImage?: string;
  goldWeight?: number; // Added for gold weight in grams
  goldWeightGrams?: number; // Database field name
  drawDate?: string; // Database field name
  imageUrl?: string; // Database field name
  createdAt?: string;
  winnerTicketNumber?: number | null;
  winnerId?: string | null;
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
  createdAt: string;
  title: string;
  role: 'admin' | 'user';
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video';
  size: number;
  user_id: string;
  uploadDate: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl: string;
  title?: string;
  active: boolean;
  position?: number;
}
