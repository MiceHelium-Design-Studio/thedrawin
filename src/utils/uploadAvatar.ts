
import { supabase } from '@/integrations/supabase/client';

export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    console.log('Uploading avatar to media bucket:', fileName);

    const { data, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      throw uploadError;
    }

    if (!data?.path) {
      throw new Error('Upload failed: No path returned');
    }

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    console.log('Avatar uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};
