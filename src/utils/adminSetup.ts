
import { supabase } from '@/integrations/supabase/client';

export const ensureFullAdmin = async () => {
  try {
    const adminEmail = 'raghidhilal@gmail.com';
    console.log(`Checking if ${adminEmail} is an admin...`);
    
    // Step 1: Find the user by email using the available methods
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('email', adminEmail)
      .maybeSingle();
    
    if (usersError) {
      console.error('Error finding user by email:', usersError);
      return;
    }
    
    // Step 2: If user exists in profiles, check/update admin status
    if (usersData) {
      const userId = usersData.id;
      
      if (!usersData.is_admin) {
        console.log(`Setting ${adminEmail} as admin...`);
        
        // Update admin status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error setting admin status:', updateError);
        } else {
          console.log(`${adminEmail} has been made an admin successfully`);
        }
      } else {
        console.log(`${adminEmail} is already an admin`);
      }
      return;
    }
    
    // Step 3: If user not found in profiles but exists in auth, we need to find them
    console.log(`Profile for ${adminEmail} not found. Checking auth system...`);
    
    // Find existing user by email (using auth.signInWithOtp with error handling)
    // Note: In a production app, you'd use admin APIs, but for this demo we'll
    // use a workaround since we don't have access to admin.getUserByEmail
    try {
      // Try to find user auth data with proper typings
      const { data, error: signInError } = await supabase.auth.signInWithOtp({
        email: adminEmail,
        options: {
          shouldCreateUser: false // Don't create new user
        }
      });
      
      if (signInError) {
        console.error('User may not exist in auth system:', signInError);
        return;
      }
      
      // Properly check and type the user object before accessing properties
      const user = data?.user;
      if (user && 'id' in user) {
        // User exists in auth, but not in profiles - create profile
        console.log(`Creating profile for ${adminEmail} with admin status...`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: adminEmail,
            is_admin: true
          });
        
        if (insertError) {
          console.error('Error creating admin profile:', insertError);
        } else {
          console.log(`Admin profile created successfully for ${adminEmail}`);
        }
      }
    } catch (authError) {
      console.error('Error checking auth system:', authError);
    }
  } catch (error) {
    console.error('Error in ensureFullAdmin:', error);
  }
};
