
import { useState } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { updateUserProfile, addUserFunds, updateUserAdminStatus, fetchUser, createUserProfile } from '@/utils/authUtils';

export const useAuthActions = (
  user: User | null,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) => {
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
      const success = await updateUserProfile(user.id, data);
      
      if (!success) {
        throw new Error('Failed to update profile');
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
      const success = await addUserFunds(user.id, amount);
      
      if (!success) {
        throw new Error('Failed to add funds');
      }

      setUser({ ...user, wallet: user.wallet + amount });
      
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

  const makeUserAdmin = async (email: string) => {
    setLoading(true);
    try {
      const success = await updateUserAdminStatus(email, true);
      
      if (!success) {
        throw new Error('Failed to update admin status');
      }
      
      // If the current user is the one being updated, update local state
      if (user && user.email === email) {
        setUser({ ...user, isAdmin: true });
      }
      
      toast({
        title: 'Admin status updated',
        description: `${email} has been made an admin.`,
      });
    } catch (error: any) {
      console.error('Make admin error:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'An error occurred while updating admin status',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    signup,
    signInWithGoogle,
    logout,
    updateProfile,
    addFunds,
    makeUserAdmin
  };
};
