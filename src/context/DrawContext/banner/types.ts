
import { Banner } from '@/types';

export interface BannerFormData {
  title?: string;
  linkUrl?: string;
  imageUrl: string;
  active: boolean;
  position?: number;
}

export interface BannerDatabaseRecord {
  id: string;
  image_url: string;
  link_url?: string;
  title?: string;
  active: boolean;
  position?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BannerValidationRules {
  input: string;
  type: 'no_script' | 'url';
  maxLength: number;
}
