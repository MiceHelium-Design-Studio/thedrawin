
import { supabase } from '@/integrations/supabase/client';

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from('profile_images') // using underscore to match existing pattern
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('profile_images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
