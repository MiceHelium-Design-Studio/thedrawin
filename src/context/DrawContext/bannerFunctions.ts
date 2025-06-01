
import { Banner } from '@/types';
import { toast } from '@/hooks/use-toast';
import { withSecurityChecks, logAuditEvent, RATE_LIMITS } from '@/utils/securityUtils';
import {
  fetchBannersFromDatabase,
  createBannerInDatabase,
  updateBannerInDatabase,
  deleteBannerFromDatabase
} from './banner/api';
import {
  validateBannerTitle,
  validateBannerUrl,
  sanitizeBannerData
} from './banner/validation';
import {
  mapDatabaseToBanners,
  mapDatabaseToBanner,
  updateBannersState,
  updateBannerInState,
  removeBannerFromState,
  revertBannersState
} from './banner/stateManager';

export const useBannerFunctions = (
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>,
  banners: Banner[]
) => {
  const fetchBanners = async (): Promise<void> => {
    try {
      const data = await fetchBannersFromDatabase();
      const fetchedBanners = mapDatabaseToBanners(data);
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
        const sanitizedData = sanitizeBannerData(banner);

        // Validate inputs
        if (sanitizedData.title) {
          const isTitleValid = await validateBannerTitle(sanitizedData.title);
          if (!isTitleValid) {
            throw new Error('Invalid title format');
          }
        }

        if (sanitizedData.linkUrl) {
          const isUrlValid = await validateBannerUrl(sanitizedData.linkUrl);
          if (!isUrlValid) {
            throw new Error('Invalid link URL format');
          }
        }

        const data = await createBannerInDatabase(sanitizedData);
        const newBanner = mapDatabaseToBanner(data);

        updateBannersState(setBanners, newBanner);
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
        const previousBanner = banners.find(b => b.id === id);
        const previousBanners = [...banners];
        
        // Optimistic update
        updateBannerInState(setBanners, id, banner);
        
        try {
          const sanitizedData = sanitizeBannerData(banner);

          // Validate inputs
          if (sanitizedData.title) {
            const isTitleValid = await validateBannerTitle(sanitizedData.title);
            if (!isTitleValid) {
              revertBannersState(setBanners, previousBanners);
              throw new Error('Invalid title format');
            }
          }
          
          if (sanitizedData.linkUrl) {
            const isUrlValid = await validateBannerUrl(sanitizedData.linkUrl);
            if (!isUrlValid) {
              revertBannersState(setBanners, previousBanners);
              throw new Error('Invalid link URL format');
            }
          }

          const updateData: any = {};
          if (banner.title !== undefined) updateData.title = sanitizedData.title || null;
          if (banner.linkUrl !== undefined) updateData.link_url = sanitizedData.linkUrl || null;
          if (banner.imageUrl !== undefined) updateData.image_url = sanitizedData.imageUrl;
          if (banner.active !== undefined) updateData.active = banner.active;
          if (banner.position !== undefined) updateData.position = banner.position;
          updateData.updated_at = new Date().toISOString();
          
          await updateBannerInDatabase(id, updateData);

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
        } catch (error) {
          revertBannersState(setBanners, previousBanners);
          throw error;
        }
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
        const previousBanners = [...banners];
        const bannerToDelete = banners.find(b => b.id === id);
        
        // Optimistic update
        removeBannerFromState(setBanners, id);
        
        try {
          await deleteBannerFromDatabase(id);

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
        } catch (error) {
          revertBannersState(setBanners, previousBanners);
          
          toast({
            variant: 'destructive',
            title: 'Failed to delete banner',
            description: 'There was a problem deleting the banner. Please try again.',
          });
          
          throw error;
        }
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
