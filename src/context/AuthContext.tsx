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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
            
            // FOR DEMO: Creating minimal user with admin rights
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user?.user_metadata?.name || 'Demo User',
              wallet: 500, // Give some funds to test
              isAdmin: true // Make user admin
            });
            setLoading(false);
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
          // FOR DEMO: Creating minimal user with admin rights
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: data.session.user.user_metadata?.name || 'Demo User',
            wallet: 500, // Give some funds to test
            isAdmin: true // Make user admin
          });
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

    // Helper function to fetch user profile - removed to avoid recursion issues
    
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
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar: data.avatar,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

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
      clearCacheAndReload
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
