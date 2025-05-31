
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
    console.error("User not authenticated:", authError);
    throw new Error("User not authenticated");
  }

  console.log('Starting profile update for user:', user.id);

  const updateData: any = {};
  
  if (full_name !== undefined) {
    updateData.name = full_name;
  }
  
  if (avatar_url !== undefined) {
    updateData.avatar_url = avatar_url;
  }

  // Ensure required fields are set for upsert
  updateData.id = user.id;
  updateData.email = user.email || '';

  console.log('Upserting profile data:', updateData);

  const { error } = await supabase
    .from('profiles')
    .upsert(updateData, {
      onConflict: 'id'
    });

  if (error) {
    console.error("Error upserting profile:", error.message, error.details);
    throw error;
  }

  console.log('Profile upserted successfully for user:', user.id);
  return true;
}
