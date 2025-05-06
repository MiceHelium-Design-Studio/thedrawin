
import { MediaItem } from '@/types';
import { getMediaItems, uploadToS3, deleteFromS3, BucketType } from '@/utils/s3Utils';
import { toast } from '@/hooks/use-toast';

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
    try {
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
      toast({
        title: 'Media uploaded',
        description: `${file.name} has been uploaded successfully.`
      });
      return newItem;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your media file.'
      });
      throw error;
    }
  };

  const deleteMedia = async (id: string, bucketType: BucketType = 'draw_images'): Promise<void> => {
    try {
      await deleteFromS3(id, bucketType);
      setMedia(media.filter(item => item.id !== id));
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
  };

  return {
    loadMedia,
    uploadMedia,
    deleteMedia
  };
};
