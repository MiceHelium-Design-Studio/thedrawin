
import { Banner } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBannerFunctions = (
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>,
  banners: Banner[]
) => {
  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        throw error;
      }

      // Map database fields to our Banner interface
      const fetchedBanners = data.map((banner) => ({
        id: banner.id,
        imageUrl: banner.image_url,
        linkUrl: banner.link_url || '/draws',
        title: banner.title || '',
        active: banner.active,
        position: banner.position,
        url: banner.image_url // Include url property to match Banner type
      }));

      setBanners(fetchedBanners);
      console.log('Fetched banners:', fetchedBanners.length);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to fetch banners',
        description: 'There was a problem fetching the banners.',
      });
      throw error;
    }
  };

  const createBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner> => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert({
          image_url: banner.imageUrl,
          link_url: banner.linkUrl,
          title: banner.title,
          active: banner.active,
          position: banner.position
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Map the database response to our Banner interface
      const newBanner: Banner = {
        id: data.id,
        imageUrl: data.image_url,
        linkUrl: data.link_url || '/draws',
        title: data.title || '',
        active: data.active,
        position: data.position,
        url: data.image_url // Include url property
      };

      // Update the banners state with the new banner
      setBanners(prev => [...prev, newBanner]);

      toast({
        title: 'Banner created',
        description: 'The banner has been successfully created.',
      });

      return newBanner;
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create banner',
        description: 'There was a problem creating the banner.',
      });
      throw error;
    }
  };

  const updateBanner = async (id: string, banner: Partial<Banner>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({
          image_url: banner.imageUrl,
          link_url: banner.linkUrl,
          title: banner.title,
          active: banner.active,
          position: banner.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the banners state
      setBanners(prev => prev.map(b => 
        b.id === id ? { ...b, ...banner } : b
      ));

      toast({
        title: 'Banner updated',
        description: 'The banner has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update banner',
        description: 'There was a problem updating the banner.',
      });
      throw error;
    }
  };

  const deleteBanner = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the banners state
      setBanners(prev => prev.filter(b => b.id !== id));

      toast({
        title: 'Banner deleted',
        description: 'The banner has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete banner',
        description: 'There was a problem deleting the banner.',
      });
      throw error;
    }
  };

  return {
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner
  };
};
