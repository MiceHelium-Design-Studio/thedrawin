
import { supabase } from '@/integrations/supabase/client';

export const ensureFullAdmin = async () => {
  try {
    const adminEmail = 'raghidhilal@gmail.com';
    console.log(`Checking if ${adminEmail} is an admin...`);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Admin setup timeout')), 3000); // Reduced timeout
    });
    
    const adminCheckPromise = (async () => {
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
      
      console.log(`Profile for ${adminEmail} not found. This is normal for new installations.`);
    })();
    
    // Race between admin check and timeout
    await Promise.race([adminCheckPromise, timeoutPromise]);
    
  } catch (error) {
    console.error('Error in ensureFullAdmin:', error);
    // Don't throw the error to prevent app from crashing
  }
};
