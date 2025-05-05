
import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Try to get a simple count from the profiles table
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful. Found', count, 'profiles.');
    return true;
  } catch (err) {
    console.error('Unexpected error testing Supabase connection:', err);
    return false;
  }
}
