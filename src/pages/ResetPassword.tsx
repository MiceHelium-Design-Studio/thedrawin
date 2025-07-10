import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { validateResetLink, updatePassword } from '@/utils/passwordResetUtils';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();

  // Validate the reset link
  const linkValidation = validateResetLink(searchParams);
  const newPassword = searchParams.get('newPassword');

  useEffect(() => {
    // If we have valid tokens from the email link, set the session
    if (linkValidation.isValid && linkValidation.accessToken && linkValidation.refreshToken) {
      supabase.auth.setSession({
        access_token: linkValidation.accessToken,
        refresh_token: linkValidation.refreshToken,
      });
    }
    
    // If we have a newPassword parameter, pre-fill the password field
    if (newPassword) {
      setPassword(decodeURIComponent(newPassword));
      setConfirmPassword(decodeURIComponent(newPassword));
    }
  }, [linkValidation, newPassword]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Update the user's password using the utility function
      await updatePassword(password);

      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);

    } catch (error: unknown) {
      console.error('Password reset error:', error);
      setError((error as Error).message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no valid reset link, show error
  if (!linkValidation.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] pattern-bg">
        <div className="w-full max-w-md mx-auto px-8">
          <div className="luxury-card p-8">
            <h2 className="text-xl font-serif text-center mb-6 text-white tracking-wider uppercase font-bold">
              {t('auth.resetPassword')}
            </h2>
            
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">
                {linkValidation.error || 'Invalid reset link. Please try requesting a new password reset.'}
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-[#F39C0A] hover:bg-[#E18A00] text-black font-medium tracking-wide uppercase"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] pattern-bg">
        <div className="w-full max-w-md mx-auto px-8">
          <div className="luxury-card p-8 text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#F39C0A] border-t-transparent mx-auto"></div>
            <h2 className="text-xl font-serif text-white tracking-wider uppercase font-bold mb-2">
              {t('auth.resetPassword')}
            </h2>
            <p className="text-white text-sm">
              Updating your password...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] pattern-bg">
      <div className="w-full max-w-md mx-auto px-8">
        <div className="luxury-card p-8">
          <h2 className="text-xl font-serif text-center mb-6 text-white tracking-wider uppercase font-bold">
            {t('auth.resetPassword')}
          </h2>
          
          {success && (
            <Alert className="mb-4 border-green-500 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Password reset successful! Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">{error}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-white font-medium tracking-wide uppercase text-xs">
                  {t('auth.newPassword') || 'New Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white text-black placeholder:text-gray-600 border-gray-300 focus:border-[#F39C0A] focus:ring-[#F39C0A]/20 pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-black" /> : <Eye className="w-5 h-5 text-black" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white font-medium tracking-wide uppercase text-xs">
                  {t('auth.confirmPassword') || 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white text-black placeholder:text-gray-600 border-gray-300 focus:border-[#F39C0A] focus:ring-[#F39C0A]/20 pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5 text-black" /> : <Eye className="w-5 h-5 text-black" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#F39C0A] hover:bg-[#E18A00] text-black font-medium tracking-wide uppercase mt-8 py-5 text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                    <span className="text-black">Updating...</span>
                  </div>
                ) : (
                  <span className="text-black">Update Password</span>
                )}
              </Button>
            </form>
          )}

          {success && (
            <div className="text-center text-white text-sm">
              You will be redirected to the login page in a few seconds...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 