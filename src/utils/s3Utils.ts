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

// Define bucket types
export type BucketType = 'profile_images' | 'banners' | 'draw_images' | 'media';

export async function getMediaItems() {
  try {
    // Query the media_items table first
    const { data: dbMedia, error: dbError } = await supabase
      .from('media_items')
      .select('*')
      .order('upload_date', { ascending: false });
    
    if (dbError) {
      console.error('Error fetching from database:', dbError);
      throw dbError;
    }
    
    if (dbMedia && dbMedia.length > 0) {
      // Transform database format to app format
      return dbMedia.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        size: item.size,
        uploadDate: item.upload_date
      }));
    }
    
    // If no items in database, fallback to S3 API
    const { data, error } = await supabase.functions.invoke('s3-media', {
      body: { action: 'list' }
    });

    if (error) throw error;
    return data.media || [];
  } catch (error) {
    console.error('Error getting media items:', error);
    toast({
      variant: 'destructive',
      title: 'Failed to load media',
      description: 'There was a problem loading your media library.'
    });
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
  // Use native Storage API for dedicated buckets
  if (bucketType === 'profile_images' || bucketType === 'banners' || bucketType === 'draw_images') {
    try {
      const uniqueFilePath = `${Date.now()}-${file.name}`;
      const fileType = determineFileType(file.name);
      
      // Upload directly to Storage
      const { data, error } = await supabase.storage
        .from(bucketType)
        .upload(uniqueFilePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketType)
        .getPublicUrl(data.path);
      
      // Record in database
      if (bucketType === 'media') {
        await supabase
          .from('media_items')
          .insert({
            id: data.path,
            name: file.name,
            url: publicUrlData.publicUrl,
            type: fileType,
            size: file.size,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
      }
      
      return {
        url: publicUrlData.publicUrl,
        key: data.path,
        name: file.name,
        size: file.size,
        type: fileType
      };
    } catch (error) {
      console.error('Error uploading to Storage:', error);
      throw error;
    }
  }
  
  // Fallback to legacy edge function method
  try {
    // 1. Get a pre-signed URL
    const { uploadUrl, fileKey, fileUrl, fileType } = await getUploadUrl(file.name, file.type);
    
    // 2. Upload the file directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }
    
    // 3. Record the upload in the database
    await supabase.functions.invoke('s3-media', {
      body: {
        action: 'recordUpload',
        fileKey,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: fileType || 'other'
      }
    });
    
    // 4. Return the file details
    return {
      url: fileUrl,
      key: fileKey,
      name: file.name,
      size: file.size,
      type: fileType || 'other'
    };
  } catch (error) {
    console.error('Error in uploadToS3:', error);
    throw error;
  }
}

export async function deleteFromS3(fileKey: string, bucketType: BucketType = 'media') {
  try {
    // If using native storage buckets
    if (bucketType !== 'media') {
      const { error } = await supabase.storage
        .from(bucketType)
        .remove([fileKey]);
      
      if (error) throw error;
      return true;
    }
    
    // Fallback to edge function
    const { error } = await supabase.functions.invoke('s3-media', {
      body: { 
        action: 'delete',
        fileKey
      }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
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
