
import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { fetchUser, createUserProfile } from '@/utils/authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (!isSubscribed) return;
        
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
            setLoading(false);
          }
        } else {
          if (isSubscribed) {
            setUser(null);
            setLoading(false);
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
          setLoading(false);
        } else if (isSubscribed) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isSubscribed) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    initializeAuth();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, setUser, loading, setLoading };
};
