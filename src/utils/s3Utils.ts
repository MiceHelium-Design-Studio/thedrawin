
import { supabase } from '../integrations/supabase/client';

export interface UploadResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
}

export async function getMediaItems() {
  try {
    const { data, error } = await supabase.functions.invoke('s3-media', {
      query: { action: 'list' }
    });

    if (error) throw error;
    return data.media || [];
  } catch (error) {
    console.error('Error getting media items:', error);
    throw error;
  }
}

export async function getUploadUrl(fileName: string, contentType: string): Promise<UploadResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('s3-media', {
      query: { 
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

export async function uploadToS3(file: File): Promise<{ url: string; key: string; name: string; size: number }> {
  // 1. Get a pre-signed URL
  const { uploadUrl, fileKey, fileUrl } = await getUploadUrl(file.name, file.type);
  
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
  
  // 3. Return the file details
  return {
    url: fileUrl,
    key: fileKey,
    name: file.name,
    size: file.size
  };
}

export async function deleteFromS3(fileKey: string) {
  try {
    const { error } = await supabase.functions.invoke('s3-media', {
      query: { 
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
