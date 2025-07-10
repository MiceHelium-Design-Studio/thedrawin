import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a password reset email to the specified email address
 * @param email - The email address to send the reset link to
 * @returns Promise with the result of the password reset request
 */
export const sendPasswordResetEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Updates the user's password (used after clicking the reset link)
 * @param newPassword - The new password to set
 * @returns Promise with the result of the password update
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
};

/**
 * Validates a password reset link by checking for required parameters
 * @param searchParams - URL search parameters
 * @returns Object indicating if the link is valid and any error messages
 */
export const validateResetLink = (searchParams: URLSearchParams) => {
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return {
      isValid: false,
      error: 'Invalid reset link. Missing required parameters.'
    };
  }

  return {
    isValid: true,
    accessToken,
    refreshToken
  };
}; 