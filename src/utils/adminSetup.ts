
import { supabase } from '@/integrations/supabase/client';

export const ensureFullAdmin = async () => {
  try {
    console.log('Checking if raghidhilal@gmail.com is an admin...');
    
    // First check if the user exists in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'raghidhilal@gmail.com')
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError);
      return;
    }
    
    // If the user exists, make sure they have admin privileges
    if (profileData) {
      if (!profileData.is_admin) {
        console.log('Setting raghidhilal@gmail.com as admin...');
        const { error } = await supabase.rpc('update_user_admin_status', {
          user_email: 'raghidhilal@gmail.com',
          is_admin_status: true
        });
        
        if (error) {
          console.error('Error setting admin status:', error);
        } else {
          console.log('raghidhilal@gmail.com has been made an admin successfully');
        }
      } else {
        console.log('raghidhilal@gmail.com is already an admin');
      }
    } else {
      console.log('User raghidhilal@gmail.com not found in profiles table');
    }
  } catch (error) {
    console.error('Error in ensureFullAdmin:', error);
  }
};
