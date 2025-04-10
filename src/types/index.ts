
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
  type: 'win' | 'draw' | 'system';
  createdAt: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
}
