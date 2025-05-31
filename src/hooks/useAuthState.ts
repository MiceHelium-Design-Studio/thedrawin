
import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { fetchUser } from '@/utils/authUtils';
import type { AuthChangeEvent } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    let initializationTimeout: NodeJS.Timeout;
    
    // Set timeout to prevent infinite loading
    initializationTimeout = setTimeout(() => {
      if (isSubscribed && loading) {
        console.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000); // Reduced from 8000 to 5000
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log("Auth state change event:", event, "Session user:", session?.user?.id);
        
        if (!isSubscribed) return;
        
        try {
          if (session?.user) {
            console.log('Processing auth session for user:', session.user.id);
            
            // For new signups, wait a bit for the trigger to complete
            if (event === 'SIGNED_UP' as AuthChangeEvent) {
              console.log('New signup detected, waiting for profile creation...');
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            // Try to fetch the user profile with shorter timeout
            let userProfile: User | null = null;
            try {
              userProfile = await Promise.race([
                fetchUser(session.user.id),
                new Promise<null>((_, reject) => 
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
                )
              ]);
            } catch (error) {
              console.log('Profile fetch failed or timed out:', error);
            }
            
            if (userProfile && isSubscribed) {
              console.log('Setting user state:', userProfile.id);
              setUser(userProfile);
            } else if (isSubscribed) {
              console.log('Profile not found, setting basic user object');
              // If we can't fetch a profile, set a basic user object
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
              console.log('Set basic user object:', basicUser.id);
            }
          } else {
            if (isSubscribed) {
              console.log('No session, setting user to null');
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          if (isSubscribed) {
            // Even on error, try to set a basic user if we have a session
            if (session?.user) {
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
              console.log('Set fallback user object due to error:', basicUser.id);
            } else {
              setUser(null);
            }
          }
        } finally {
          if (isSubscribed) {
            setLoading(false);
            clearTimeout(initializationTimeout);
          }
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth - checking for existing session');
        const { data } = await supabase.auth.getSession();
        console.log('Initial session check:', data.session?.user?.id);
        
        if (data.session?.user && isSubscribed) {
          // Try to fetch existing profile with timeout
          let userProfile: User | null = null;
          try {
            userProfile = await Promise.race([
              fetchUser(data.session.user.id),
              new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
              )
            ]);
          } catch (error) {
            console.log('Initial profile fetch failed or timed out:', error);
          }
          
          if (userProfile) {
            console.log('Initialization: Setting user from session');
            setUser(userProfile);
          } else {
            // Fallback to basic user object
            const basicUser: User = {
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
              wallet: 500,
              isAdmin: data.session.user.email === 'raghidhilal@gmail.com',
              avatar: data.session.user.user_metadata?.avatar_url || null,
              avatar_url: data.session.user.user_metadata?.avatar_url || null
            };
            setUser(basicUser);
            console.log('Initialization: Set fallback user object');
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
