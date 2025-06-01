
import { supabase } from '@/integrations/supabase/client';
import { Banner } from '@/types';
import { BannerDatabaseRecord, BannerFormData } from './types';

export const fetchBannersFromDatabase = async (): Promise<BannerDatabaseRecord[]> => {
  console.log('Fetching banners from database...');
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('Database error fetching banners:', error);
    throw error;
  }

  return data || [];
};

export const createBannerInDatabase = async (bannerData: BannerFormData): Promise<BannerDatabaseRecord> => {
  console.log('Creating new banner:', bannerData);

  const { data, error } = await supabase
    .from('banners')
    .insert({
      image_url: bannerData.imageUrl,
      link_url: bannerData.linkUrl || null,
      title: bannerData.title || null,
      active: bannerData.active,
      position: bannerData.position
    })
    .select('*')
    .single();

  if (error) {
    console.error('Database error creating banner:', error);
    throw error;
  }

  if (!data) {
    throw new Error('No data returned from banner creation');
  }

  return data;
};

export const updateBannerInDatabase = async (id: string, updateData: any): Promise<void> => {
  console.log('Updating banner with ID:', id, 'Data:', updateData);

  const { error } = await supabase
    .from('banners')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Database error updating banner:', error);
    throw error;
  }

  console.log('Banner updated successfully');
};

export const deleteBannerFromDatabase = async (id: string): Promise<void> => {
  console.log('Deleting banner with ID:', id);

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Database error deleting banner:', error);
    throw error;
  }

  console.log('Banner deleted successfully');
};
