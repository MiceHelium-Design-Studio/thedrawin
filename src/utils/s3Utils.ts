
import { supabase } from '../integrations/supabase/client';

export interface UploadResponse {
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
    const { data, error } = await supabase
      .storage
      .from('drawinmedialib')
      .list();

    if (error) throw error;
    
    // Convert Supabase storage items to our application format
    const media = data
      .filter(item => !item.name.includes('.emptyFolderPlaceholder'))
      .map(item => ({
        id: item.name,
        name: item.name,
        url: getFileUrl(item.name),
        size: item.metadata?.size || 0,
        uploadDate: item.created_at || new Date().toISOString(),
        type: getFileType(item.name)
      }));
    
    return media;
  } catch (error) {
    console.error('Error getting media items:', error);
    throw error;
  }
}

export async function getUploadUrl(fileName: string, contentType: string): Promise<UploadResponse> {
  // With Supabase Storage we don't need pre-signed URLs
  // Instead we'll return a structure that's compatible with our existing code
  return {
    fileKey: fileName,
    fileUrl: getFileUrl(fileName),
    fileType: categorizeContentType(contentType)
  };
}

export async function uploadToS3(file: File): Promise<{ url: string; key: string; name: string; size: number; type: string }> {
  try {
    // Sanitize the filename to prevent path traversal
    const sanitizedFileName = file.name.replace(/[^\w\s.-]/g, '');
    const fileKey = `${Date.now()}-${sanitizedFileName}`;
    
    console.log(`Attempting to upload file: ${fileKey} to drawinmedialib`);
    
    // Upload file directly to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('drawinmedialib')
      .upload(fileKey, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }
    
    console.log('Upload successful:', data);
    
    const fileUrl = getFileUrl(data?.path || fileKey);
    const fileType = categorizeContentType(file.type);
    
    // Return file details in the same format as before
    return {
      url: fileUrl,
      key: fileKey,
      name: file.name,
      size: file.size,
      type: fileType
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFromS3(fileKey: string) {
  try {
    const { error } = await supabase
      .storage
      .from('drawinmedialib')
      .remove([fileKey]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getStorageStats(): Promise<StorageStats> {
  try {
    const { data, error } = await supabase
      .storage
      .from('drawinmedialib')
      .list();
    
    if (error) throw error;
    
    // Calculate storage statistics
    let totalSize = 0;
    const fileTypeCount = {
      image: 0,
      document: 0,
      other: 0
    };
    
    data
      .filter(item => !item.name.includes('.emptyFolderPlaceholder'))
      .forEach(item => {
        const size = item.metadata?.size || 0;
        totalSize += size;
        
        const type = getFileType(item.name);
        fileTypeCount[type] += 1;
      });
    
    return {
      totalFiles: data.length,
      totalSize,
      fileTypeCount,
      averageSize: data.length > 0 ? totalSize / data.length : 0
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw error;
  }
}

// Helper function to determine file type based on extension
function getFileType(key: string): 'image' | 'document' | 'other' {
  const extension = key.split('.').pop()?.toLowerCase() || '';
  
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

// Helper function to categorize content type
function categorizeContentType(contentType: string): 'image' | 'document' | 'other' {
  const imageMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 
    'image/webp', 'image/tiff', 'image/bmp'
  ];

  const documentMimeTypes = [
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv'
  ];
  
  if (imageMimeTypes.includes(contentType)) {
    return 'image';
  } else if (documentMimeTypes.includes(contentType)) {
    return 'document';
  } else {
    return 'other';
  }
}

// Helper function to get the public URL for a file
function getFileUrl(path: string): string {
  const { data } = supabase
    .storage
    .from('drawinmedialib')
    .getPublicUrl(path);
  
  return data.publicUrl;
}
