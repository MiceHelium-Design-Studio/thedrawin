import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { fetchUser } from '@/utils/authUtils';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const initializationTimeout: NodeJS.Timeout = setTimeout(() => {
      if (isSubscribed && loading) {
        console.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000);
    
    const createUserFromSession = async (session: Session): Promise<User | null> => {
      if (!session?.user) return null;
      
      try {
        console.log('Creating user from session for:', session.user.id);
        
        // Try to fetch profile but don't fail if it doesn't exist
        try {
          const userProfile = await Promise.race([
            fetchUser(session.user.id),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
            )
          ]) as User | null;
          
          if (userProfile) {
            console.log('Successfully fetched user profile:', userProfile.id);
            return userProfile;
          }
        } catch (error) {
          console.log('Profile fetch failed, using fallback:', error);
        }
        
        console.log('Creating fallback user object for session user');
        
        // Create fallback user object when no profile exists
        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          wallet: 500, // Default wallet amount
          isAdmin: session.user.email === 'raghidhilal@gmail.com',
          avatar: session.user.user_metadata?.avatar_url || null,
          avatar_url: session.user.user_metadata?.avatar_url || null
        };
        
        console.log('Created fallback user:', fallbackUser.id, 'isAdmin:', fallbackUser.isAdmin);
        return fallbackUser;
        
      } catch (error) {
        console.error('Error in createUserFromSession:', error);
        return null;
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log("Auth state change event:", event, "Session user:", session?.user?.id);
        
        if (!isSubscribed) return;
        
        // Handle token refresh specifically
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully, updating user state');
          if (session?.user && user) {
            // Keep existing user data but ensure session is fresh
            console.log('Token refresh: maintaining user state for:', user.id);
            return; // Don't recreate user object, just acknowledge refresh
          }
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          if (isSubscribed) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        try {
          if (session?.user) {
            console.log('Processing auth session for user:', session.user.id);
            
            // For token refresh, if we already have a user, just verify it's the same user
            if (event === 'TOKEN_REFRESHED' && user && user.id === session.user.id) {
              console.log('Token refreshed for existing user, no need to refetch profile');
              return;
            }
            
            const userProfile = await createUserFromSession(session);
            
            if (userProfile && isSubscribed) {
              console.log('Setting user state:', userProfile.id);
              setUser(userProfile);
            }
          } else {
            if (isSubscribed) {
              console.log('No session, setting user to null');
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          
          // On refresh token errors, specifically handle the case
          if (event === 'TOKEN_REFRESHED') {
            console.error('Token refresh failed, user may need to re-authenticate');
            if (isSubscribed) {
              setUser(null);
              setLoading(false);
            }
            return;
          }
          
          // Even on errors, try to create a basic user if we have a session
          if (isSubscribed && session?.user) {
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              wallet: 500,
              isAdmin: session.user.email === 'raghidhilal@gmail.com',
              avatar: session.user.user_metadata?.avatar_url || null,
              avatar_url: session.user.user_metadata?.avatar_url || null
            };
            setUser(basicUser);
            console.log('Set basic user object due to error:', basicUser.id);
          } else if (isSubscribed) {
            setUser(null);
          }
        } finally {
          if (isSubscribed && event !== 'TOKEN_REFRESHED') {
            setLoading(false);
            clearTimeout(initializationTimeout);
          }
        }
      }
    );

    // Check for existing session with improved error handling
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth - checking for existing session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isSubscribed) {
            setLoading(false);
            setUser(null);
          }
          return;
        }
        
        console.log('Initial session check:', data.session?.user?.id);
        
        if (data.session?.user && isSubscribed) {
          const userProfile = await createUserFromSession(data.session);
          
          if (userProfile) {
            console.log('Initialization: Setting user from session');
            setUser(userProfile);
          }
        } else if (isSubscribed) {
          console.log('Initialization: No session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isSubscribed) {
          setUser(null);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
          clearTimeout(initializationTimeout);
        }
      }
    };
    
    initializeAuth();

    return () => {
      isSubscribed = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return { user, setUser, loading, setLoading };
};
