
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
    
    // Reduce timeout from 8 seconds to 3 seconds
    initializationTimeout = setTimeout(() => {
      if (isSubscribed && loading) {
        console.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, 3000);
    
    const createUserFromSession = async (session: any): Promise<User | null> => {
      if (!session?.user) return null;
      
      try {
        // Try to fetch profile first
        const userProfile = await fetchUser(session.user.id);
        
        if (userProfile) {
          console.log('Using fetched profile:', userProfile.id);
          return userProfile;
        }
        
        // Fallback to basic user object if profile doesn't exist
        console.log('Creating basic user object for:', session.user.id);
        return {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          wallet: 500,
          isAdmin: session.user.email === 'raghidhilal@gmail.com',
          avatar: session.user.user_metadata?.avatar_url || null,
          avatar_url: session.user.user_metadata?.avatar_url || null
        };
      } catch (error) {
        console.error('Error creating user from session:', error);
        return null;
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log("Auth state change event:", event, "Session user:", session?.user?.id);
        
        if (!isSubscribed) return;
        
        try {
          if (session?.user) {
            console.log('Processing auth session for user:', session.user.id);
            
            // For new signups, add a small delay
            if (event === 'SIGNED_UP' as AuthChangeEvent) {
              console.log('New signup detected, waiting for profile creation...');
              await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2000ms
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
          if (isSubscribed) {
            // Try basic user object on error
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

    // Check for existing session with faster initialization
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth - checking for existing session');
        const { data } = await supabase.auth.getSession();
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
