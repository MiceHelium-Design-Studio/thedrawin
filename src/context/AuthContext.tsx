import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  clearCacheAndReload: () => void;
  forceAdminAccess: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to create a basic user object
        setUser({
          id: userId,
          email: '',
          wallet: 0,
          isAdmin: false
        });
      } else if (data) {
        // Map database fields to User type
        const userProfile: User = {
          id: data.id,
          email: data.email || '',
          name: data.name || undefined,
          avatar: data.avatar || undefined,
          wallet: data.wallet || 0,
          isAdmin: data.is_admin || false
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        
        if (!isSubscribed) return;
        
        if (session?.user) {
          // Use setTimeout to prevent potential recursion
          setTimeout(() => {
            if (!isSubscribed) return;
            
            // Fetch profile data from the profiles table
            fetchUserProfile(session.user.id);
          }, 0);
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
          // Fetch profile data from the profiles table
          fetchUserProfile(data.session.user.id);
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        variant: 'destructive',
        title: 'Google login failed',
        description: error.message || 'An error occurred during Google login',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully.',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'An error occurred during signup',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: error.message || 'An error occurred during logout',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    setLoading(true);
    try {
      // Fixed: Use service role to bypass RLS for this operation
      // Or make sure the RLS policies are properly set up
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar: data.avatar,
          wallet: data.wallet !== undefined ? data.wallet : user.wallet,
          is_admin: data.isAdmin !== undefined ? data.isAdmin : user.isAdmin
        })
        .eq('id', user.id);

      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }

      // If successful, update local state
      setUser({ ...user, ...data });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'An error occurred while updating your profile',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async (amount: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const newAmount = user.wallet + amount;
      
      const { error } = await supabase
        .from('profiles')
        .update({ wallet: newAmount })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setUser({ ...user, wallet: newAmount });
      
      toast({
        title: 'Funds added',
        description: `$${amount} has been added to your wallet.`,
      });
    } catch (error: any) {
      console.error('Add funds error:', error);
      toast({
        variant: 'destructive',
        title: 'Transaction failed',
        description: error.message || 'An error occurred while adding funds',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCacheAndReload = () => {
    queryClient.clear();
    
    toast({
      title: 'Cache cleared',
      description: 'Reloading application...',
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const forceAdminAccess = async (email: string) => {
    setLoading(true);
    try {
      console.log(`Attempting to grant admin access to ${email}`);
      
      // First get the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Error finding user:', userError);
        throw userError;
      }

      if (!userData) {
        console.error(`User with email ${email} not found`);
        throw new Error(`User with email ${email} not found`);
      }

      console.log(`Found user with ID: ${userData.id}, updating to admin status`);

      // Update the user to be an admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating admin status:', updateError);
        throw updateError;
      }

      console.log(`Successfully granted admin access to ${email}`);
      
      toast({
        title: 'Admin access granted',
        description: `${email} is now an administrator`,
      });

      // Refresh current user if it's the same one
      if (user && user.email === email) {
        console.log('Updating current user to admin status');
        setUser({ ...user, isAdmin: true });
      }
      
      // Force a data refresh by manually fetching the profile again if it's the current user
      if (user && user.id === userData.id) {
        fetchUserProfile(userData.id);
      }
    } catch (error: any) {
      console.error('Force admin access error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to grant admin access',
        description: error.message || 'An error occurred while updating admin status',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      signInWithGoogle, 
      logout, 
      updateProfile, 
      addFunds,
      clearCacheAndReload,
      forceAdminAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
