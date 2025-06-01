import { Banner } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { withSecurityChecks, logAuditEvent, RATE_LIMITS, sanitizeInput, validateInput } from '@/utils/securityUtils';

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
        position: banner.position
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
    return withSecurityChecks(
      async () => {
        console.log('Creating new banner:', banner);

        // Validate and sanitize inputs
        const sanitizedTitle = sanitizeInput(banner.title || '');
        const sanitizedLinkUrl = sanitizeInput(banner.linkUrl || '');
        const sanitizedImageUrl = sanitizeInput(banner.imageUrl);

        // Server-side validation
        if (sanitizedTitle) {
          const isTitleValid = await validateInput({ 
            input: sanitizedTitle, 
            type: 'no_script', 
            maxLength: 200 
          });
          if (!isTitleValid) {
            throw new Error('Invalid title format');
          }
        }

        if (sanitizedLinkUrl) {
          const isUrlValid = await validateInput({ 
            input: sanitizedLinkUrl, 
            type: 'url', 
            maxLength: 500 
          });
          if (!isUrlValid) {
            throw new Error('Invalid link URL format');
          }
        }

        const { data, error } = await supabase
          .from('banners')
          .insert({
            image_url: sanitizedImageUrl,
            link_url: sanitizedLinkUrl || null,
            title: sanitizedTitle || null,
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
          position: data.position
        };

        // Update the banners state with the new banner
        setBanners(prev => [...prev, newBanner]);
        console.log('Banner created successfully:', newBanner);

        toast({
          title: 'Banner created',
          description: 'The banner has been successfully created.',
        });

        return newBanner;
      },
      {
        rateLimitAction: RATE_LIMITS.BANNER_CREATE.action,
        rateLimitConfig: { 
          limit: RATE_LIMITS.BANNER_CREATE.limit, 
          windowMinutes: RATE_LIMITS.BANNER_CREATE.windowMinutes 
        },
        auditAction: 'banner_create',
        auditTableName: 'banners',
      }
    );
  };

  const updateBanner = async (id: string, banner: Partial<Banner>): Promise<void> => {
    return withSecurityChecks(
      async () => {
        console.log('Updating banner with ID:', id, 'Data:', banner);
        
        // Store previous state for audit logging
        const previousBanner = banners.find(b => b.id === id);
        
        // First, update optimistically
        const previousBanners = [...banners];
        setBanners(prev => prev.map(b => 
          b.id === id ? { ...b, ...banner } : b
        ));
        
        // Validate and sanitize inputs
        const updateData: any = {};
        
        if (banner.title !== undefined) {
          const sanitizedTitle = sanitizeInput(banner.title);
          if (sanitizedTitle) {
            const isTitleValid = await validateInput({ 
              input: sanitizedTitle, 
              type: 'no_script', 
              maxLength: 200 
            });
            if (!isTitleValid) {
              setBanners(previousBanners);
              throw new Error('Invalid title format');
            }
          }
          updateData.title = sanitizedTitle || null;
        }
        
        if (banner.linkUrl !== undefined) {
          const sanitizedLinkUrl = sanitizeInput(banner.linkUrl);
          if (sanitizedLinkUrl) {
            const isUrlValid = await validateInput({ 
              input: sanitizedLinkUrl, 
              type: 'url', 
              maxLength: 500 
            });
            if (!isUrlValid) {
              setBanners(previousBanners);
              throw new Error('Invalid link URL format');
            }
          }
          updateData.link_url = sanitizedLinkUrl || null;
        }
        
        if (banner.imageUrl !== undefined) {
          updateData.image_url = sanitizeInput(banner.imageUrl);
        }
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
        
        // Log the change for audit purposes
        await logAuditEvent({
          action: 'banner_update',
          tableName: 'banners',
          recordId: id,
          oldValues: previousBanner,
          newValues: { ...previousBanner, ...banner },
        });
        
        toast({
          title: 'Banner updated',
          description: 'The banner has been successfully updated.',
        });
      },
      {
        rateLimitAction: RATE_LIMITS.BANNER_UPDATE.action,
        rateLimitConfig: { 
          limit: RATE_LIMITS.BANNER_UPDATE.limit, 
          windowMinutes: RATE_LIMITS.BANNER_UPDATE.windowMinutes 
        },
        auditAction: 'banner_update',
        auditTableName: 'banners',
      }
    );
  };

  const deleteBanner = async (id: string): Promise<void> => {
    return withSecurityChecks(
      async () => {
        console.log('Deleting banner with ID:', id);
        
        // Store current banners before the delete operation
        const previousBanners = [...banners];
        const bannerToDelete = banners.find(b => b.id === id);
        
        // First, update the state optimistically
        setBanners(prev => prev.filter(b => b.id !== id));
        
        // Attempt the delete operation
        const { error } = await supabase
          .from('banners')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Database error deleting banner:', error);
          // Revert to previous state if there's an error
          setBanners(previousBanners);
          
          toast({
            variant: 'destructive',
            title: 'Failed to delete banner',
            description: 'There was a problem deleting the banner. Please try again.',
          });
          
          throw error;
        }

        console.log('Banner deleted successfully');
        
        // Log the deletion for audit purposes
        await logAuditEvent({
          action: 'banner_delete',
          tableName: 'banners',
          recordId: id,
          oldValues: bannerToDelete,
        });
        
        toast({
          title: 'Banner deleted',
          description: 'The banner has been successfully deleted.',
        });
      },
      {
        rateLimitAction: RATE_LIMITS.BANNER_DELETE.action,
        rateLimitConfig: { 
          limit: RATE_LIMITS.BANNER_DELETE.limit, 
          windowMinutes: RATE_LIMITS.BANNER_DELETE.windowMinutes 
        },
        auditAction: 'banner_delete',
        auditTableName: 'banners',
      }
    );
  };

  return {
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner
  };
};
