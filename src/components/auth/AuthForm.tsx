
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => Promise<void>;
  onResetPassword?: (email: string, newPassword?: string) => Promise<void>;
  loading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  onResetPassword,
  loading
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState(''); // Store email from login form for reset
  const { t } = useTranslation();
  const { toast } = useToast();

  const validateForm = () => {
    if (isResetMode) {
      if (!resetEmail) {
        setError(t('errors.emailRequired') || 'Email is required');
        return false;
      }
      if (!password) {
        setError(t('errors.passwordRequired') || 'Password is required');
        return false;
      }
      if (password.length < 6) {
        setError(t('errors.passwordTooShort') || 'Password must be at least 6 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError(t('errors.passwordsDoNotMatch') || 'Passwords do not match');
        return false;
      }
      return true;
    }

    if (!email || !password) {
      setError(t('errors.validation'));
      return false;
    }
    
    if (mode === 'signup' && (!name || !phone)) {
      setError(t('errors.validation'));
      return false;
    }
    
    if (password.length < 6) {
      setError(t('errors.validation'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isResetMode) {
        // Handle password reset with new password
        console.log('Submitting password reset for:', resetEmail);
        if (onResetPassword) {
          await onResetPassword(resetEmail, password);
          setSuccess(t('auth.resetPasswordSuccess') || 'Password reset successfully!');
          // Reset form after success
          setTimeout(() => {
            setIsResetMode(false);
            setPassword('');
            setConfirmPassword('');
            setSuccess('');
          }, 3000);
        }
      } else {
        console.log(`Submitting ${mode} form for:`, email);
        await onSubmit({
          email,
          password,
          ...(mode === 'signup' ? {
            name,
            phone
          } : {})
        });
      }
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        setError(error.message || t('errors.general'));
      } else {
        setError(t('errors.general'));
      }
    }
  };

  const handleResetPassword = () => {
    // Check if email is entered in login form
    if (!email.trim()) {
      toast({
        title: t('errors.emailRequired') || 'Email is required',
        description: t('auth.pleaseEnterEmail') || 'Please enter your email address first',
      });
      return;
    }
    
    // Store the email for reset and switch to reset mode
    setResetEmail(email);
    setIsResetMode(true);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleBackToLogin = () => {
    setIsResetMode(false);
    setPassword('');
    setConfirmPassword('');
    setResetEmail('');
    setError('');
    setSuccess('');
  };

  // Password reset form
  if (isResetMode) {
    return (
      <div className="w-full max-w-md mx-auto px-8">
        <div className="flex items-center mb-6">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-[#F39C0A] hover:text-[#E18A00] mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-serif text-center flex-1 text-white tracking-wider uppercase font-bold">
            {t('auth.resetPassword') || 'Reset Password'}
          </h2>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-white">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-500/10">
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-white font-medium tracking-wide uppercase text-xs">{t('auth.email') || 'Email'}</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email address"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
              className="bg-white text-black placeholder:text-gray-600 border-gray-300 focus:border-[#F39C0A] focus:ring-[#F39C0A]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white font-medium tracking-wide uppercase text-xs">{t('auth.newPassword') || 'New Password'}</Label>
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
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-black" /> : <Eye className="w-5 h-5 text-black" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white font-medium tracking-wide uppercase text-xs">{t('auth.confirmPassword') || 'Confirm Password'}</Label>
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
                aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                <span className="text-black">{t('common.loading')}</span>
              </div>
            ) : (
              <span className="text-black">{t('auth.resetPassword') || 'RESET PASSWORD'}</span>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Regular login/signup form
  return (
    <div className="w-full max-w-md mx-auto px-8">
      <h2 className="text-xl font-serif text-center mb-6 text-white tracking-wider uppercase font-bold">
        {mode === 'login' ? t('auth.login') : t('auth.signup')}
      </h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-white">{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium tracking-wide uppercase text-xs">{t('profile.firstName')}</Label>
              <Input 
                id="name" 
                placeholder={t('profile.firstName')} 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required={mode === 'signup'}
                className="bg-white text-black placeholder:text-gray-600 border-gray-300 focus:border-[#F39C0A] focus:ring-[#F39C0A]/20" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white font-medium tracking-wide uppercase text-xs">{t('profile.phone')}</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1 (555) 123-4567" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                required={mode === 'signup'}
                className="bg-white text-black placeholder:text-gray-600 border-gray-300 focus:border-[#F39C0A] focus:ring-[#F39C0A]/20" 
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium tracking-wide uppercase text-xs">{t('auth.email')}</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="bg-white text-black placeholder:text-gray-600 border-gray-300 focus:border-[#F39C0A] focus:ring-[#F39C0A]/20" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-medium tracking-wide uppercase text-xs">{t('auth.password')}</Label>
          <div className="relative">
            <Input
              id="password"
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
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-black" /> : <Eye className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
        {mode === 'login' && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-xs text-[#F39C0A] hover:underline focus:outline-none font-medium"
            >
              {t('auth.forgotPassword') || 'Reset password'}
            </button>
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#F39C0A] hover:bg-[#E18A00] text-black font-medium tracking-wide uppercase mt-8 py-5 text-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              <span className="text-black">{t('common.loading')}</span>
            </div>
          ) : (
            <span className="text-black">{mode === 'login' ? t('auth.login') : t('auth.signup')}</span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
