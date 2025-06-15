
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

  const uploadImageWithRetry = async (file: File, retries = 3): Promise<string | null> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/profile-${Date.now()}.${fileExt}`;

        console.log(`Upload attempt ${attempt}/${retries} for file:`, fileName);

        // Upload to profile-images bucket
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload attempt ${attempt} failed:`, uploadError);
          
          if (attempt < retries) {
            console.log(`Retrying upload in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
          
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);

        console.log(`Upload successful on attempt ${attempt}:`, data.publicUrl);

        // Record in media_items table for tracking
        try {
          const { error: dbError } = await supabase
            .from('media_items')
            .insert({
              id: fileName,
              name: file.name,
              url: data.publicUrl,
              type: 'image',
              size: file.size,
              user_id: user!.id
            });

          if (dbError) {
            console.warn('Failed to record in media_items, but upload was successful:', dbError);
          }
        } catch (dbErr) {
          console.warn('Database recording error, but upload was successful:', dbErr);
        }

        return data.publicUrl;
      } catch (error) {
        console.error(`Upload attempt ${attempt} error:`, error);
        
        if (attempt === retries) {
          throw error;
        }
      }
    }
    
    return null;
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    try {
      setUploading(true);
      
      const uploadedUrl = await uploadImageWithRetry(imageFile);
      
      if (uploadedUrl) {
        toast({
          title: 'Upload successful',
          description: 'Your profile image has been uploaded.',
        });
      }
      
      return uploadedUrl;
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
