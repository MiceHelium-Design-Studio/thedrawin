
import { MediaItem } from '@/types';
import { getMediaItems, uploadToS3, deleteFromS3, BucketType } from '@/utils/s3Utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { withSecurityChecks, logAuditEvent, RATE_LIMITS, validateInput } from '@/utils/securityUtils';

export const useMediaFunctions = (
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>,
  media: MediaItem[]
) => {
  // Helper function to validate media type
  const validateMediaType = (type: any): "image" | "document" | "video" => {
    if (type === 'image' || type === 'document' || type === 'video') {
      return type as "image" | "document" | "video";
    }
    
    // Default to the most appropriate type based on the string
    if (typeof type === 'string') {
      if (type.includes('image')) return 'image';
      if (type.includes('document')) return 'document';
      if (type.includes('video')) return 'video';
    }
    
    // Fallback to 'document' as default
    return 'document';
  };

  const loadMedia = async (userId: string): Promise<void> => {
    try {
      const mediaItems = await getMediaItems();
      
      // Transform items to match MediaItem interface
      const formattedItems: MediaItem[] = mediaItems.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: validateMediaType(item.type),
        size: item.size || 0,
        user_id: item.user_id || userId || '',
        uploadDate: item.uploadDate || new Date().toISOString()
      }));
      
      setMedia(formattedItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load media',
        description: 'There was an error loading your media files.'
      });
      throw error;
    }
  };

  const uploadMedia = async (file: File, userId: string, bucketType: BucketType = 'draw_images'): Promise<MediaItem> => {
    return withSecurityChecks(
      async () => {
        // Validate file name
        const isFileNameValid = await validateInput({ 
          input: file.name, 
          type: 'no_script', 
          maxLength: 255 
        });
        if (!isFileNameValid) {
          throw new Error('Invalid file name');
        }

        // File size validation (client-side)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error('File size exceeds 10MB limit');
        }

        // File type validation
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'video/mp4', 'video/mov', 'video/avi', 'video/mkv',
          'application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          throw new Error('File type not allowed');
        }

        const determineMediaType = (fileName: string): "image" | "document" | "video" => {
          const extension = fileName.split('.').pop()?.toLowerCase() || '';
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
          const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
        
          if (imageExtensions.includes(extension)) return 'image';
          if (videoExtensions.includes(extension)) return 'video';
          return 'document';
        };
        
        const mediaType = determineMediaType(file.name);
        
        const uploadResult = await uploadToS3(file, bucketType);
        
        const newItem: MediaItem = {
          id: uploadResult.key,
          name: uploadResult.name,
          url: uploadResult.url,
          type: mediaType,
          size: uploadResult.size,
          user_id: userId || '',
          uploadDate: new Date().toISOString(),
        };

        setMedia([newItem, ...media]);
        
        // Log the upload for audit purposes
        await logAuditEvent({
          action: 'media_upload',
          tableName: 'media_items',
          recordId: newItem.id,
          newValues: {
            name: newItem.name,
            type: newItem.type,
            size: newItem.size,
            bucket_type: bucketType,
          },
        });
        
        toast({
          title: 'Media uploaded',
          description: `${file.name} has been uploaded successfully.`
        });
        
        return newItem;
      },
      {
        rateLimitAction: RATE_LIMITS.MEDIA_UPLOAD.action,
        rateLimitConfig: { 
          limit: RATE_LIMITS.MEDIA_UPLOAD.limit, 
          windowMinutes: RATE_LIMITS.MEDIA_UPLOAD.windowMinutes 
        },
        auditAction: 'media_upload',
        auditTableName: 'media_items',
      }
    );
  };

  const deleteMedia = async (id: string, bucketType: BucketType = 'draw_images'): Promise<void> => {
    return withSecurityChecks(
      async () => {
        const mediaToDelete = media.find(item => item.id === id);
        
        try {
          // First attempt to delete from database if it's a media item
          try {
            // Direct database operation to ensure deletion regardless of context state
            const { error } = await supabase
              .from('media_items')
              .delete()
              .eq('id', id);
              
            if (error) {
              console.log('Database delete error or item not found in database:', error);
              // Continue with S3 deletion even if database deletion failed
            }
          } catch (dbError) {
            console.log('Error attempting database deletion:', dbError);
            // Continue with S3 deletion
          }
          
          // Then delete from S3 storage
          await deleteFromS3(id, bucketType);
          
          // Update local state
          setMedia(media.filter(item => item.id !== id));
          
          // Log the deletion for audit purposes
          await logAuditEvent({
            action: 'media_delete',
            tableName: 'media_items',
            recordId: id,
            oldValues: mediaToDelete,
          });
          
          toast({
            title: 'Media deleted',
            description: 'The media file has been deleted successfully.'
          });
        } catch (error) {
          console.error('Error deleting media:', error);
          toast({
            variant: 'destructive',
            title: 'Deletion failed',
            description: 'There was an error deleting the media file.'
          });
          throw error;
        }
      },
      {
        rateLimitAction: RATE_LIMITS.MEDIA_DELETE.action,
        rateLimitConfig: { 
          limit: RATE_LIMITS.MEDIA_DELETE.limit, 
          windowMinutes: RATE_LIMITS.MEDIA_DELETE.windowMinutes 
        },
        auditAction: 'media_delete',
        auditTableName: 'media_items',
      }
    );
  };

  return {
    loadMedia,
    uploadMedia,
    deleteMedia
  };
};
