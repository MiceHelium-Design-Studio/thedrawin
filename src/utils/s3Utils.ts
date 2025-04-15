
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

export async function getUploadUrl(fileName: string, contentType: string): Promise<UploadResponse> {
  try {
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

export async function uploadToS3(file: File): Promise<{ url: string; key: string; name: string; size: number; type: string }> {
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
}

export async function deleteFromS3(fileKey: string) {
  try {
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
