
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
    if (!imageFile || !user) {
      console.error('Missing image file or user for upload');
      return null;
    }

    try {
      setUploading(true);
      console.log('--- Starting image upload to media bucket ---');
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
      console.log('[ImageUpload] Uploading to media bucket:', fileName);

      // Upload to the 'media' bucket
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[ImageUpload] Upload error:', uploadError);
        throw uploadError;
      }

      if (!data?.path) {
        throw new Error('Upload failed: No path returned');
      }

      console.log('[ImageUpload] Upload successful:', data);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      console.log('[ImageUpload] Public URL:', urlData.publicUrl);

      // Try to record in media_items table for tracking (optional - don't fail if this doesn't work)
      try {
        console.log('[ImageUpload] Inserting in media_items:', {
          id: data.path,
          name: imageFile.name,
          url: urlData.publicUrl,
          type: 'image',
          size: imageFile.size,
          user_id: user.id
        });

        const { error: dbError } = await supabase
          .from('media_items')
          .insert({
            id: data.path,
            name: imageFile.name,
            url: urlData.publicUrl,
            type: 'image',
            size: imageFile.size,
            user_id: user.id
          });

        if (dbError) {
          // Check for RLS violation
          if (
            dbError.code === '42501' ||
            dbError.message?.toLowerCase().includes('row-level security') ||
            dbError.message?.toLowerCase().includes('permission denied')
          ) {
            toast({
              variant: 'destructive',
              title: 'Upload succeeded but not tracked',
              description:
                "Image uploaded but couldn't be tracked in your media library (security restriction). Your profile will still update.",
            });
            console.warn('[ImageUpload] RLS violation or permission denied on media_items:', dbError);
          } else {
            toast({
              variant: 'destructive',
              title: 'Upload succeeded but not tracked',
              description: "Image uploaded, but it couldn't be saved in your library: " + dbError.message,
            });
            console.warn('[ImageUpload] Non-RLS DB error on media_items:', dbError);
          }
        }
      } catch (dbErr) {
        toast({
          variant: 'destructive',
          title: 'Upload partial success',
          description: 'Image uploaded, but not recorded in your media library.',
        });
        console.warn('[ImageUpload] DB insert error:', dbErr);
      }

      toast({
        title: 'Upload successful',
        description: 'Your profile image has been uploaded.',
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('[ImageUpload] Error uploading image:', error);
      // Provide more specific error messages
      let errorMessage = 'There was a problem uploading your image. Please try again.';
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
    uploadImage,
    clearImageState
  };
};
