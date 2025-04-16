
import { supabase } from '@/integrations/supabase/client';

export const ensureFullAdmin = async () => {
  try {
    console.log('Checking if raghidhilal@gmail.com is an admin...');
    
    // Step 1: Check if user exists in auth system first
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail('raghidhilal@gmail.com');
    
    if (userError) {
      console.error('Error checking user in auth system:', userError);
      return;
    }
    
    if (!userData || !userData.user) {
      console.log('User raghidhilal@gmail.com not found in auth system');
      return;
    }
    
    const userId = userData.user.id;
    
    // Step 2: Check if user has a profile in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error checking profile:', profileError);
      return;
    }
    
    // Step 3: If profile exists, update admin status if needed
    if (profileData) {
      if (!profileData.is_admin) {
        console.log('Setting raghidhilal@gmail.com as admin...');
        
        // Direct update using the UUID rather than email
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error setting admin status:', updateError);
        } else {
          console.log('raghidhilal@gmail.com has been made an admin successfully');
        }
      } else {
        console.log('raghidhilal@gmail.com is already an admin');
      }
    } else {
      // Step 4: If no profile, create one with admin status
      console.log('Creating profile for raghidhilal@gmail.com with admin status...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'raghidhilal@gmail.com',
          is_admin: true
        });
      
      if (insertError) {
        console.error('Error creating admin profile:', insertError);
      } else {
        console.log('Admin profile created successfully for raghidhilal@gmail.com');
      }
    }
  } catch (error) {
    console.error('Error in ensureFullAdmin:', error);
  }
};
