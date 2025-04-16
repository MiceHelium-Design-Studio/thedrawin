
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UploadResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  fileType: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  fileTypeCount: {
    image: number;
    document: number;
    other: number;
  };
  averageSize: number;
}

// Expand BucketType to include 'media'
export type BucketType = 'profile_images' | 'banners' | 'draw_images' | 'media';

export async function getMediaItems() {
  try {
    console.log('Fetching media items...');
    // First try to query the media_items table directly (preferred approach)
    const { data: dbMedia, error: dbError } = await supabase
      .from('media_items')
      .select('*')
      .order('upload_date', { ascending: false });
    
    if (dbError) {
      console.error('Error fetching from database:', dbError);
      // Continue to attempt fallback methods
    } else if (dbMedia && dbMedia.length > 0) {
      console.log('Successfully fetched media items from database:', dbMedia.length);
      // Transform database format to app format
      return dbMedia.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        size: item.size,
        uploadDate: item.upload_date
      }));
    } else {
      console.log('No media items found in database, will use fallback methods');
    }
    
    // If no items in database or error, try direct bucket listing
    try {
      console.log('Attempting to list storage bucket items...');
      // Try direct storage bucket listing as a fallback
      const { data: storageData, error: storageError } = await supabase.storage
        .from('media')
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (storageError) {
        console.error('Error listing storage bucket:', storageError);
        throw storageError;
      }
      
      if (storageData && storageData.length > 0) {
        console.log('Successfully listed items from storage bucket:', storageData.length);
        // Transform storage format to app format
        return storageData.map(item => {
          const url = supabase.storage.from('media').getPublicUrl(item.name).data.publicUrl;
          return {
            id: item.id || item.name,
            name: item.name,
            url: url,
            type: determineFileType(item.name),
            size: item.metadata?.size || 0,
            uploadDate: item.created_at || new Date().toISOString()
          };
        });
      }
    } catch (storageListError) {
      console.error('Error in storage listing fallback:', storageListError);
      // Continue to next fallback
    }
    
    // Edge function fallback (last resort)
    try {
      console.log('Attempting to use edge function as last resort...');
      const { data, error } = await supabase.functions.invoke('s3-media', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Successfully fetched media items from edge function');
      return data.media || [];
    } catch (edgeFunctionError) {
      console.error('Edge function fallback failed:', edgeFunctionError);
      throw edgeFunctionError;
    }
  } catch (error) {
    console.error('Error getting media items (all methods failed):', error);
    toast({
      variant: 'destructive',
      title: 'Failed to load media',
      description: 'There was a problem loading your media library. Please try again later.'
    });
    // Return empty array to prevent application crashes
    return [];
  }
}

export async function getUploadUrl(fileName: string, contentType: string, bucketType: BucketType = 'media'): Promise<UploadResponse> {
  try {
    // If using native storage buckets
    if (bucketType === 'profile_images' || bucketType === 'banners' || bucketType === 'draw_images') {
      const uniqueFilePath = `${Date.now()}-${fileName}`;
      
      // Get a presigned URL directly from Storage API
      const { data, error } = await supabase.storage
        .from(bucketType)
        .createSignedUploadUrl(uniqueFilePath);
      
      if (error) throw error;
      
      // Generate public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketType)
        .getPublicUrl(uniqueFilePath);
      
      return {
        uploadUrl: data.signedUrl,
        fileKey: data.path,
        fileUrl: publicUrlData.publicUrl,
        fileType: determineFileType(fileName)
      };
    }
    
    // Fallback to edge function
    console.log('Using edge function to get upload URL...');
    const { data, error } = await supabase.functions.invoke('s3-media', {
      body: { 
        action: 'getUploadUrl',
        fileName,
        contentType
      }
    });

    if (error) throw error;
    return data as UploadResponse;
  } catch (error) {
    console.error('Error getting upload URL:', error);
    throw error;
  }
}

export async function uploadToS3(file: File, bucketType: BucketType = 'media'): Promise<{ url: string; key: string; name: string; size: number; type: string }> {
  // Use direct upload method - simplifying to address database recursion issue
  try {
    console.log(`Uploading ${file.name} to ${bucketType} bucket...`);
    const uniqueFilePath = `${Date.now()}-${file.name}`;
    const fileType = determineFileType(file.name);
    
    // Upload directly using the uploadOrUpdateFile method which doesn't trigger the recursion
    const { data, error } = await supabase.storage
      .from(bucketType)
      .upload(uniqueFilePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error(`Error uploading to ${bucketType}:`, error);
      throw error;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketType)
      .getPublicUrl(data.path);
    
    const url = publicUrlData.publicUrl;
    
    toast({
      title: 'Upload complete',
      description: `${file.name} has been successfully uploaded.`
    });
    
    console.log(`Successfully uploaded to ${bucketType}:`, data.path);
    console.log('Public URL:', url);
    
    // Try to record in database if it's a media item
    if (bucketType === 'media') {
      try {
        const { error: insertError } = await supabase
          .from('media_items')
          .insert({
            id: data.path,
            name: file.name,
            url: url,
            type: fileType,
            size: file.size,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
        
        if (insertError) {
          console.error('Error recording in database, but upload was successful:', insertError);
        }
      } catch (dbError) {
        console.error('Database error, but upload was successful:', dbError);
      }
    }
    
    return {
      url: url,
      key: data.path,
      name: file.name,
      size: file.size,
      type: fileType
    };
  } catch (error) {
    console.error('Error in uploadToS3:', error);
    toast({
      variant: 'destructive',
      title: 'Upload failed',
      description: `Failed to upload ${file.name}. Please try again.`
    });
    throw error;
  }
}

export async function deleteFromS3(fileKey: string, bucketType: BucketType = 'media') {
  try {
    console.log(`Deleting ${fileKey} from ${bucketType}...`);
    
    // If using native storage buckets
    if (bucketType !== 'media') {
      const { error } = await supabase.storage
        .from(bucketType)
        .remove([fileKey]);
      
      if (error) {
        console.error(`Error deleting from ${bucketType}:`, error);
        throw error;
      }
      
      console.log(`Successfully deleted from ${bucketType}`);
      return true;
    }
    
    // Fallback to edge function
    console.log('Using edge function to delete media...');
    const { error } = await supabase.functions.invoke('s3-media', {
      body: { 
        action: 'delete',
        fileKey
      }
    });

    if (error) {
      console.error('Error deleting via edge function:', error);
      throw error;
    }
    
    console.log('Successfully deleted via edge function');
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    toast({
      variant: 'destructive',
      title: 'Deletion failed',
      description: 'There was a problem deleting the file. Please try again.'
    });
    throw error;
  }
}

export async function getStorageStats(): Promise<StorageStats> {
  try {
    const { data, error } = await supabase.functions.invoke('s3-media', {
      body: { 
        action: 'getStats'
      }
    });

    if (error) throw error;
    return data as StorageStats;
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw error;
  }
}

// Helper function to determine file type based on file name
function determineFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'tiff', 'bmp'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];
  
  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (documentExtensions.includes(extension)) {
    return 'document';
  } else {
    return 'other';
  }
}
