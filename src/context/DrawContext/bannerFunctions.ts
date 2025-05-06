import { Banner } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBannerFunctions = (
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>,
  banners: Banner[]
) => {
  const fetchBanners = async (): Promise<void> => {
    try {
      console.log('Fetching banners from database...');
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        console.error('Database error fetching banners:', error);
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
      console.log('Successfully fetched banners:', fetchedBanners.length);
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
      console.log('Creating new banner:', banner);
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
        console.error('Database error creating banner:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from banner creation');
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
      console.log('Banner created successfully:', newBanner);

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
      console.log('Updating banner with ID:', id, 'Data:', banner);
      
      // First, update optimistically
      const previousBanners = [...banners];
      setBanners(prev => prev.map(b => 
        b.id === id ? { ...b, ...banner } : b
      ));
      
      // Prepare database update object
      const updateData: any = {};
      if (banner.imageUrl !== undefined) updateData.image_url = banner.imageUrl;
      if (banner.linkUrl !== undefined) updateData.link_url = banner.linkUrl;
      if (banner.title !== undefined) updateData.title = banner.title;
      if (banner.active !== undefined) updateData.active = banner.active;
      if (banner.position !== undefined) updateData.position = banner.position;
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('banners')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Database error updating banner:', error);
        // Revert to previous state
        setBanners(previousBanners);
        throw error;
      }

      console.log('Banner updated successfully');
      
      toast({
        title: 'Banner updated',
        description: 'The banner has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update banner',
        description: 'There was a problem updating the banner. The changes have been reverted.',
      });
      throw error;
    }
  };

  const deleteBanner = async (id: string): Promise<void> => {
    try {
      console.log('Deleting banner with ID:', id);
      
      // First, update the state optimistically
      const previousBanners = [...banners];
      setBanners(prev => prev.filter(b => b.id !== id));
      
      // Then attempt the delete operation
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        // If there's an error, revert to the previous state
        console.error('Database error deleting banner:', error);
        setBanners(previousBanners);
        throw error;
      }

      // We don't need to update state again since we did it optimistically
      console.log('Banner deleted successfully');

      toast({
        title: 'Banner deleted',
        description: 'The banner has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete banner',
        description: 'There was a problem deleting the banner. The banner list has been restored.',
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
