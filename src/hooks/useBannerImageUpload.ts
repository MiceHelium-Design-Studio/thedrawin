import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useBannerImageUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file.',
      });
      return;
    }

    // Validate file size (max 10MB for banners)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 10MB.',
      });
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const uploadBannerImage = async (): Promise<string | null> => {
    if (!imageFile || !user) {
      console.error('Missing image file or user for banner upload');
      return null;
    }

    try {
      setUploading(true);
      console.log('--- Starting banner image upload to media bucket ---');
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Create user-specific folder path to match storage policies
      const filePath = `${user.id}/${fileName}`;
      console.log('[BannerImageUpload] Uploading to media bucket:', filePath);

      // Upload to the 'media' bucket in user-specific folder
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[BannerImageUpload] Upload error:', uploadError);
        throw uploadError;
      }

      if (!data?.path) {
        throw new Error('Upload failed: No path returned');
      }

      console.log('[BannerImageUpload] Upload successful:', data);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      console.log('[BannerImageUpload] Public URL:', urlData.publicUrl);

      // Try to record in media_items table for tracking (optional)
      try {
        console.log('[BannerImageUpload] Inserting in media_items:', {
          id: data.path,
          name: fileName,
          url: urlData.publicUrl,
          type: 'image',
          size: imageFile.size,
          user_id: user.id
        });

        const { error: dbError } = await supabase
          .from('media_items')
          .insert({
            id: data.path,
            name: fileName,
            url: urlData.publicUrl,
            type: 'image',
            size: imageFile.size,
            user_id: user.id
          });

        if (dbError) {
          console.warn('[BannerImageUpload] DB error on media_items (non-blocking):', dbError);
        }
      } catch (dbErr) {
        console.warn('[BannerImageUpload] DB insert error (non-blocking):', dbErr);
      }

      toast({
        title: '✅ Upload Successful!',
        description: 'Your banner image has been uploaded and is ready to use.',
        duration: 4000,
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('[BannerImageUpload] Error uploading banner image:', error);
      
      let errorMessage = 'There was a problem uploading your banner image. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'Storage bucket not found. Please contact support.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to upload files. Please check your account.';
        } else if (error.message.includes('size')) {
          errorMessage = 'The file is too large. Please select a smaller image.';
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: errorMessage,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clearImageState = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  return {
    imageFile,
    imagePreview,
    uploading,
    handleImageChange,
    uploadBannerImage,
    clearImageState
  };
}; 