
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useImageUpload = () => {
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    try {
      setUploading(true);
      console.log('Starting image upload...');

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      console.log('Uploading to media bucket with filename:', fileName);

      // Upload to the existing 'media' bucket instead of 'profile-images'
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', urlData.publicUrl);

      // Record in media_items table for tracking
      try {
        const { error: dbError } = await supabase
          .from('media_items')
          .insert({
            id: fileName,
            name: imageFile.name,
            url: urlData.publicUrl,
            type: 'image',
            size: imageFile.size,
            user_id: user.id
          });

        if (dbError) {
          console.warn('Failed to record in media_items, but upload was successful:', dbError);
        }
      } catch (dbErr) {
        console.warn('Database recording error, but upload was successful:', dbErr);
      }

      toast({
        title: 'Upload successful',
        description: 'Your profile image has been uploaded.',
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was a problem uploading your image. Please try again.',
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
    uploadImage,
    clearImageState
  };
};
