
import { useState } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from '@/utils/passwordResetUtils';

export const useAuthActions = (
  user: User | null,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) => {
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Starting email/password login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data.user?.id);
      
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: (error as Error).message || 'An error occurred during login',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      console.log('Starting Google OAuth login');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Google login error:', error);
        throw error;
      }

      console.log('Google OAuth initiated successfully');

    } catch (error: unknown) {
      console.error('Google login error:', error);
      toast({
        variant: 'destructive',
        title: 'Google login failed',
        description: (error as Error).message || 'An error occurred during Google login',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Signup error from Supabase:', error);
        throw error;
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        if (!data.session && data.user && !data.user.email_confirmed_at) {
          toast({
            title: 'Check your email',
            description: 'Please check your email for a confirmation link to complete your signup.',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Your account has been created successfully.',
          });
        }
      }
      
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      let errorMessage = (error as Error).message || 'An error occurred during signup';
      
      if ((error as Error).message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if ((error as Error).message?.includes('Password should be at least')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if ((error as Error).message?.includes('Unable to validate email address')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log('Starting logout process');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      console.log('Logout successful');
      
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
      const { updateUserProfile } = await import('@/utils/authUtils');
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
      const { addUserFunds } = await import('@/utils/authUtils');
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
      const { updateUserAdminStatus } = await import('@/utils/authUtils');
      const success = await updateUserAdminStatus(email, true);
      
      if (!success) {
        throw new Error('Failed to update admin status');
      }
      
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

  const resetPassword = async (email: string, newPassword?: string) => {
    setLoading(true);
    try {
      console.log('Starting password reset for:', email);
      
      if (newPassword) {
        // If new password is provided, try to update directly
        console.log('Attempting direct password update');
        
        // First try to sign up the user with the new password (this will work if user doesn't exist)
        const { data, error } = await supabase.auth.signUp({
          email,
          password: newPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              email_confirmed: true // Mark email as confirmed to skip confirmation
            }
          }
        });

        if (error) {
          // If user already exists, we need to use the email reset flow
          if (error.message?.includes('User already registered')) {
            console.log('User exists, sending reset email');
            
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password?newPassword=${encodeURIComponent(newPassword)}`
            });

            if (resetError) {
              console.error('Password reset error:', resetError);
              throw resetError;
            }

            console.log('Password reset email sent successfully');
            
            toast({
              title: 'Password reset email sent',
              description: 'Please check your email and click the link to complete the password reset.',
            });
          } else {
            console.error('Signup error:', error);
            throw error;
          }
        } else {
          // User was created successfully or password was updated
          console.log('Password reset/account creation successful:', data.user?.id);
          
          if (data.user) {
            toast({
              title: 'Password set successfully!',
              description: 'Your password has been saved. You can now log in with your email and password.',
            });
          }
        }
      } else {
        // Send password reset email using the utility function
        await sendPasswordResetEmail(email);

        console.log('Password reset email sent successfully');
        
        toast({
          title: 'Password reset email sent',
          description: 'Please check your email and click the link to reset your password.',
        });
      }
      
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      let errorMessage = (error as Error).message || 'An error occurred during password reset';
      
      if ((error as Error).message?.includes('User not found')) {
        errorMessage = 'No account found with this email address.';
      } else if ((error as Error).message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before resetting your password.';
      } else if ((error as Error).message?.includes('For security purposes')) {
        errorMessage = 'Password reset email sent. Please check your inbox.';
      } else if ((error as Error).message?.includes('Unable to validate email address')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Password reset failed',
        description: errorMessage,
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
    makeUserAdmin,
    resetPassword
  };
};
