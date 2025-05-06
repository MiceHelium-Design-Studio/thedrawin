
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://vfmulngualkzxwdzcbwb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbXVsbmd1YWxrenh3ZHpjYndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjUyNzUsImV4cCI6MjA1OTkwMTI3NX0.4289VvjF4cN8B-f4-fRYXb7mSfau-r1xefFGwoJdUCI";

/**
 * Creates a Supabase client configured for browser usage
 * with persistence enabled for auth sessions
 */
export function createBrowserClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}
