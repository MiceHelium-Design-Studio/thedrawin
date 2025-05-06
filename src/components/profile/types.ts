
import { User } from '@/types';

export type PaymentMethod = 'regular' | 'card' | 'whish' | 'western-union' | 'usdt';

export interface ProfileProps {
  user: User | null;
  loading: boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  logout: () => Promise<void>;
}
