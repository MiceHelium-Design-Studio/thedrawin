
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
      const isRecursionError = error.message && (
        error.message.includes('infinite recursion') || 
        error.message.includes('recursive') || 
        error.message.includes('recursively')
      );
      
      if (isRecursionError) {
        return {
          isConnected: false,
          error: 'Database Policy Error',
          errorDetails: 'There is an issue with the database security policies. Please contact your administrator to fix the infinite recursion in the profiles table policies.'
        };
      }
      
      // Parse Postgres error codes
      if (error.code === '28P01') {
        return {
          isConnected: false,
          error: 'Authentication Error',
          errorDetails: 'Invalid credentials. Please check your Supabase URL and API key.'
        };
      } else if (error.code === '42P01') {
        return {
          isConnected: false,
          error: 'Table Not Found',
          errorDetails: 'The profiles table does not exist in your database.'
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
    
    // Network-related errors
    if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
      return {
        isConnected: false,
        error: 'Network Error',
        errorDetails: 'Unable to reach the Supabase service. Please check your internet connection.'
      };
    }
    
    return {
      isConnected: false,
      error: 'Connection Error',
      errorDetails: errorMessage
    };
  }
}
