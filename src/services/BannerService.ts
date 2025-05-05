
import { supabase } from '@/integrations/supabase/client';
import { Banner } from '@/types';
import { uploadToS3, deleteFromS3 } from '@/utils/s3Utils';

export const BannerService = {
  async fetchBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('type', 'banner');

    if (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }

    // Map database structure to Banner interface
    return data?.map(item => ({
      id: item.id,
      imageUrl: item.url,
      url: item.url, // Add url property for backwards compatibility
      linkUrl: item.url, // Default to the same URL
      active: true // Default to active
    })) || [];
  },

  async createBanner(banner: Omit<Banner, 'id'>, userId: string): Promise<Banner> {
    // Generate a unique ID for the banner
    const bannerId = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const { data, error } = await supabase
      .from('media_items')
      .insert({
        id: bannerId,
        name: `banner-${Date.now()}`,
        url: banner.imageUrl,
        type: 'banner',
        user_id: userId,
        size: 0 // This would need to be calculated in a real implementation
      })
      .select();

    if (error) {
      console.error('Error creating banner:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Failed to create banner - no data returned');
    }

    return {
      id: data[0].id,
      imageUrl: banner.imageUrl,
      url: banner.imageUrl, // Add url property for backwards compatibility
      linkUrl: banner.linkUrl,
      active: banner.active
    };
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<void> {
    const { error } = await supabase
      .from('media_items')
      .update({
        url: updates.imageUrl
        // Add other fields if needed
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  async deleteBanner(id: string): Promise<void> {
    const { error } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },

  async uploadBannerImage(file: File): Promise<string> {
    try {
      const { url } = await uploadToS3(file, 'banners');
      return url;
    } catch (error) {
      console.error('Error uploading banner image:', error);
      throw error;
    }
  },

  async deleteBannerImage(fileKey: string): Promise<void> {
    try {
      await deleteFromS3(fileKey, 'banners');
    } catch (error) {
      console.error('Error deleting banner image:', error);
      throw error;
    }
  }
};
