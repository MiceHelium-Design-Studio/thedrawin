
import { supabase } from '@/integrations/supabase/client';

interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
}

export async function updateUserProfile({ full_name, avatar_url }: UpdateProfileData): Promise<boolean> {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const updateData: any = {};
  
  if (full_name !== undefined) {
    updateData.name = full_name;
  }
  
  if (avatar_url !== undefined) {
    updateData.avatar_url = avatar_url;
  }

  // Also ensure email is set if it's not already there
  if (!updateData.email && user.email) {
    updateData.email = user.email;
  }

  console.log('Updating user profile:', updateData);

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...updateData
    });

  if (error) {
    console.error("Error updating profile:", error.message);
    throw error;
  }

  console.log('Profile updated successfully');
  return true;
}
