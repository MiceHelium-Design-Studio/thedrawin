
import { supabase } from '@/integrations/supabase/client';

export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    console.log('Uploading avatar to profile-images bucket:', fileName);

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    console.log('Avatar uploaded successfully:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};
