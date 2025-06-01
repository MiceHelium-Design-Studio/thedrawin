
import { supabase } from '@/integrations/supabase/client';

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

  console.log('Uploading avatar to profile-images bucket:', fileName);

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
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
}
