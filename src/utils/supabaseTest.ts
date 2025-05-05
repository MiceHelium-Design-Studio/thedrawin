
import { supabase } from '@/integrations/supabase/client';

interface ConnectionTestResult {
  isConnected: boolean;
  error?: string;
  errorDetails?: string;
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    // Try to get a simple count from the profiles table
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      
      // Check for recursion error in the error message
      const isRecursionError = error.message && error.message.includes('infinite recursion');
      if (isRecursionError) {
        return {
          isConnected: false,
          error: 'Database Policy Error',
          errorDetails: 'There is an issue with the database security policies. Please contact your administrator to fix the infinite recursion in the profiles table policies.'
        };
      }
      
      return {
        isConnected: false,
        error: 'Database Error',
        errorDetails: error.message
      };
    }
    
    console.log('Supabase connection successful. Found', count, 'profiles.');
    return {
      isConnected: true
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unexpected error testing Supabase connection:', err);
    return {
      isConnected: false,
      error: 'Connection Error',
      errorDetails: errorMessage
    };
  }
}
