import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export const fetchUser = async (userId: string): Promise<User | null> => {
  try {
    console.log('Fetching user profile for:', userId);
    
    // Use a more permissive query with better error handling
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

    if (error) {
      console.error('Error fetching user profile:', error);
      // Don't throw error, return null to allow fallback
      return null;
    }

    if (!data) {
      console.log('No profile data found for user:', userId);
      return null;
    }

    console.log('Successfully fetched user profile:', data.id);
    // Map the database fields to our User type
    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      avatar: data.avatar || undefined,
      avatar_url: data.avatar_url || undefined,
      wallet: data.wallet || 0,
      isAdmin: data.is_admin || false,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Unexpected error in fetchUser:', error);
    // Return null instead of throwing to allow graceful fallback
    return null;
  }
};

export const createUserProfile = async (authUser: SupabaseUser): Promise<User | null> => {
  // Check if profile exists first, but don't try to create it manually
  // This avoids RLS errors during profile creation
  try {
    console.log('Checking for existing profile for user:', authUser.id);
    
    // Wait a moment for any database triggers to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userProfile = await fetchUser(authUser.id);
    
    if (userProfile) {
      console.log('Successfully found existing profile:', userProfile.id);
      return userProfile;
    }
    
    console.log('No profile found in database, will use fallback user object');
    
    // Instead of trying to manually create a profile (which causes RLS errors),
    // return null and let the auth state create a fallback user object
    return null;
    
  } catch (error) {
    console.error('Error checking for user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<boolean> => {
  try {
    const updateData: Record<string, unknown> = {
      name: data.name,
      avatar: data.avatar,
    };
    
    if (data.avatar_url) {
      updateData.avatar_url = data.avatar_url;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Update profile error:', error);
    return false;
  }
};

export const addUserFunds = async (userId: string, amount: number): Promise<boolean> => {
  try {
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const newAmount = (currentUser.wallet || 0) + amount;
    
    const { error } = await supabase
      .from('profiles')
      .update({ wallet: newAmount })
      .eq('id', userId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Add funds error:', error);
    return false;
  }
};

export const updateUserAdminStatus = async (email: string, isAdmin: boolean): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('update_user_admin_status', {
      user_email: email,
      is_admin_status: isAdmin
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Make admin error:', error);
    return false;
  }
};

export const createDemoUser = (session: Session): User => {
  const email = session.user.email || '';
  const isFullAdmin = email === 'raghidhilal@gmail.com';
  
  return {
    id: session.user.id,
    email: email,
    name: session.user?.user_metadata?.name || 'Demo User',
    wallet: 500,
    isAdmin: isFullAdmin || true,
    avatar: session.user?.user_metadata?.avatar || null,
    avatar_url: null
  };
};

/**
 * Monitor token refresh events and provide debugging information
 */
export const monitorTokenRefresh = () => {
  // Listen for session changes and log token refresh events
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 Token refreshed successfully at:', new Date().toISOString());
      console.log('🔄 New token expires at:', session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'Unknown');
      
      // Verify the refresh was successful
      if (session?.access_token) {
        console.log('✅ New access token obtained, length:', session.access_token.length);
      } else {
        console.error('❌ Token refresh failed - no access token in session');
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('👋 User signed out at:', new Date().toISOString());
    } else if (event === 'SIGNED_IN') {
      console.log('👋 User signed in at:', new Date().toISOString());
      console.log('🔄 Initial token expires at:', session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'Unknown');
    }
  });
};

/**
 * Check current session status and token expiration
 */
export const checkTokenStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error getting session:', error);
      return { hasValidToken: false, error };
    }
    
    if (!session) {
      console.log('ℹ️ No active session found');
      return { hasValidToken: false, error: 'No session' };
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const timeUntilExpiry = expiresAt - now;
    
    console.log('🔍 Token status check:');
    console.log('  - Current time:', new Date().toISOString());
    console.log('  - Token expires at:', new Date(expiresAt * 1000).toISOString());
    console.log('  - Time until expiry:', Math.floor(timeUntilExpiry / 60), 'minutes');
    console.log('  - Has refresh token:', !!session.refresh_token);
    
    const hasValidToken = timeUntilExpiry > 60; // Valid if more than 1 minute left
    
    if (!hasValidToken) {
      console.warn('⚠️ Token is expired or expiring soon');
    }
    
    return {
      hasValidToken,
      session,
      expiresAt,
      timeUntilExpiry,
      hasRefreshToken: !!session.refresh_token
    };
  } catch (error) {
    console.error('❌ Error checking token status:', error);
    return { hasValidToken: false, error };
  }
};

/**
 * Manually trigger token refresh (for testing purposes)
 */
export const manualTokenRefresh = async () => {
  try {
    console.log('🔄 Manually triggering token refresh...');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('❌ Manual token refresh failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Manual token refresh successful');
    return { success: true, session: data.session };
  } catch (error) {
    console.error('❌ Error during manual token refresh:', error);
    return { success: false, error };
  }
};
