
import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { fetchUser, createUserProfile } from '@/utils/authUtils';

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
    }, 10000); // 10 second timeout
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (!isSubscribed) return;
        
        try {
          if (session?.user) {
            // Try to fetch existing profile first
            let userProfile = await fetchUser(session.user.id);
            
            // If no profile exists, create one
            if (!userProfile) {
              console.log('Creating new user profile...');
              userProfile = await createUserProfile(session.user);
            }
            
            if (userProfile && isSubscribed) {
              setUser(userProfile);
            }
          } else {
            if (isSubscribed) {
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          if (isSubscribed) {
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

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user && isSubscribed) {
          // Try to fetch existing profile first
          let userProfile = await fetchUser(data.session.user.id);
          
          // If no profile exists, create one
          if (!userProfile) {
            console.log('Creating new user profile during initialization...');
            userProfile = await createUserProfile(data.session.user);
          }
          
          if (userProfile) {
            setUser(userProfile);
          }
        } else if (isSubscribed) {
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
