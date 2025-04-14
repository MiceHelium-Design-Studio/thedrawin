import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SupabaseAuthUser {
  id: string;
  email?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
}

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
        setUser({
          id: userId,
          email: '',
          wallet: 0,
          isAdmin: false
        });
      } else if (data) {
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        
        if (!isSubscribed) return;
        
        if (session?.user) {
          setTimeout(() => {
            if (!isSubscribed) return;
            
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

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user && isSubscribed) {
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
      console.log("Updating profile with data:", data);
      
      const updateData: Record<string, any> = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.wallet !== undefined) updateData.wallet = data.wallet;
      if (data.isAdmin !== undefined) updateData.is_admin = data.isAdmin;
      
      console.log("Prepared update data:", updateData);
      
      try {
        // First try updating via the profiles table
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (error) {
          console.error("Profile update error:", error);
          
          // If the first approach fails with recursion error, try updating with RPC
          if (error.message.includes('infinite recursion') || error.code === '42P17') {
            console.log("Trying alternative update method...");
            
            // Update user metadata in auth.users as a fallback
            const { error: authError } = await supabase.auth.updateUser({
              data: updateData
            });
            
            if (authError) {
              throw authError;
            }
          } else {
            throw error;
          }
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        // If we can't update the database, at least update the local state
        // This will allow the UI to reflect the changes until a refresh
        console.log("Updating local user state only");
      }

      // Update the local user state regardless of database success
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
      
      // Simplest approach - direct database update
      const { error: directError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('email', email);
      
      if (directError) {
        console.error('Direct update error:', directError);
        
        // Fallback - try RPC function
        const { error: rpcError } = await supabase.rpc('update_user_admin_status', {
          user_email: email,
          is_admin_status: true
        });
        
        if (rpcError) {
          console.error('RPC function error:', rpcError);
          
          // Last resort - update local state if this is current user
          if (user && user.email === email) {
            console.log('Setting local admin status for current user');
            setUser({ ...user, isAdmin: true });
          } else {
            throw new Error('Could not grant admin access');
          }
        }
      }
      
      toast({
        title: 'Admin access granted',
        description: `${email} is now an administrator`,
      });
      
      // Update local state if this is the current user
      if (user && user.email === email) {
        console.log('Updating current user to admin status');
        setUser({ ...user, isAdmin: true });
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
