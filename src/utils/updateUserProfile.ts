
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

  // Also update email if it's not already set
  if (!updateData.email) {
    updateData.email = user.email;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    console.error("Error updating profile:", error.message);
    throw error;
  }

  return true;
}
