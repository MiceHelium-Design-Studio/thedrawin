
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
    
    // Increase timeout to 5 seconds and add better error handling
    initializationTimeout = setTimeout(() => {
      if (isSubscribed && loading) {
        console.warn('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, 5000);
    
    const createUserFromSession = async (session: any): Promise<User | null> => {
      if (!session?.user) return null;
      
      try {
        console.log('Creating user from session for:', session.user.id);
        
        // First try to fetch profile with a shorter timeout
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
        
        throw new Error('No profile found');
      } catch (error) {
        console.warn('Profile fetch failed, creating fallback user:', error);
        
        // Create fallback user object immediately
        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          wallet: 500,
          isAdmin: session.user.email === 'raghidhilal@gmail.com',
          avatar: session.user.user_metadata?.avatar_url || null,
          avatar_url: session.user.user_metadata?.avatar_url || null
        };
        
        return fallbackUser;
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
          
          // Set fallback user even on errors to prevent auth blocking
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
            console.log('Set fallback user object due to error:', basicUser.id);
          } else if (isSubscribed) {
            setUser(null);
          }
        } finally {
          if (isSubscribed) {
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
