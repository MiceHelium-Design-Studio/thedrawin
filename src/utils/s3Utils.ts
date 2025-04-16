
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
    
    // Return empty array to prevent application crashes
    return [];
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
    // Sanitize filename to prevent issues with special characters
    const sanitizedFileName = sanitizeFileName(fileName);
    console.log(`Getting upload URL for ${sanitizedFileName} in ${bucketType} bucket...`);
    
    // Generate a unique file path
    const uniqueFilePath = `${Date.now()}-${sanitizedFileName}`;
    
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
      fileType: determineFileType(sanitizedFileName)
    };
  } catch (error) {
    console.error('Error getting upload URL:', error);
    throw error;
  }
}

export async function uploadToS3(file: File, bucketType: BucketType = 'media'): Promise<{ url: string; key: string; name: string; size: number; type: string }> {
  try {
    // Sanitize the filename
    const originalFileName = file.name;
    const sanitizedFileName = sanitizeFileName(originalFileName);
    console.log(`Uploading ${sanitizedFileName} to ${bucketType} bucket...`);
    
    const uniqueFilePath = `${Date.now()}-${sanitizedFileName}`;
    const fileType = determineFileType(sanitizedFileName);
    
    // Upload directly to the storage bucket
    const { data, error } = await supabase.storage
      .from(bucketType)
      .upload(uniqueFilePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    if (!data || !data.path) {
      throw new Error('Upload failed: No data returned from upload');
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketType)
      .getPublicUrl(data.path);
    
    const url = publicUrlData.publicUrl;
    
    // Show success toast
    toast({
      title: 'Upload complete',
      description: `${sanitizedFileName} has been successfully uploaded.`
    });
    
    console.log(`Successfully uploaded to ${bucketType}:`, data.path);
    console.log('Public URL:', url);
    
    // Try to record in database if it's a media item - but don't let it block the process
    if (bucketType === 'media') {
      try {
        const { error: insertError } = await supabase
          .from('media_items')
          .insert({
            id: data.path,
            name: sanitizedFileName,
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
      name: sanitizedFileName,
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
    
    const { error } = await supabase.storage
      .from(bucketType)
      .remove([fileKey]);
    
    if (error) {
      console.error(`Error deleting from ${bucketType}:`, error);
      throw error;
    }
    
    // If it's a media item, also remove from database
    if (bucketType === 'media') {
      try {
        const { error: dbError } = await supabase
          .from('media_items')
          .delete()
          .eq('id', fileKey);
        
        if (dbError) {
          console.error('Error removing from database, but file was deleted:', dbError);
        }
      } catch (dbError) {
        console.error('Database error, but file was deleted:', dbError);
      }
    }
    
    console.log(`Successfully deleted from ${bucketType}`);
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
    // Implement a simplified version that just returns mock data
    // since the edge function is having issues
    return {
      totalFiles: 0,
      totalSize: 0,
      fileTypeCount: {
        image: 0,
        document: 0,
        other: 0
      },
      averageSize: 0
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      fileTypeCount: {
        image: 0,
        document: 0,
        other: 0
      },
      averageSize: 0
    };
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

// Helper function to sanitize filenames to avoid issues with special characters
function sanitizeFileName(fileName: string): string {
  // Remove spaces, special characters, and replace with underscores
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace any non-alphanumeric chars (except . _ -) with underscores
    .replace(/_{2,}/g, '_');           // Replace multiple consecutive underscores with a single one
  
  if (sanitized !== fileName) {
    console.log(`Sanitized filename from "${fileName}" to "${sanitized}"`);
  }
  
  return sanitized;
}
