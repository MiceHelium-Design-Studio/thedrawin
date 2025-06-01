
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useAuthForm = () => {
  const { login, signup, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (data: { 
    email: string; 
    password: string; 
    name?: string; 
    phone?: string 
  }) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log(`Handling ${mode} submission for:`, data.email);
      
      if (mode === 'login') {
        await login(data.email, data.password);
        console.log('Login completed successfully');
        
        toast({
          title: 'Welcome back!',
          description: 'You are now signed in.',
        });
        
        // Always redirect to /home after successful login
        const from = location.state?.from?.pathname || "/home";
        console.log('Redirecting to:', from);
        navigate(from, { replace: true });
        
      } else {
        await signup(data.email, data.password, data.name || '', data.phone);
        console.log('Signup completed successfully');
        
        toast({
          title: 'Account created!',
          description: 'Your account has been created successfully.',
        });
        
        // For signup, always go to home
        navigate("/home", { replace: true });
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid email or password. Please check your credentials and try again.',
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          variant: 'destructive',
          title: 'Email not confirmed',
          description: 'Please check your email and click the confirmation link before signing in.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: `${mode === 'login' ? 'Login' : 'Signup'} failed`,
          description: error.message || 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log(`Starting ${provider} social login`);
      
      if (provider === 'Google') {
        await signInWithGoogle();
        console.log('Google OAuth flow initiated');
        
        // Note: For OAuth, the redirect happens automatically
        // The success handling will be done in the auth state change listener
        
      } else {
        toast({
          title: 'Coming soon',
          description: `${provider} login will be available soon.`,
        });
      }
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast({
        variant: 'destructive',
        title: `${provider} login failed`,
        description: error.message || 'An error occurred during social login.',
      });
    } finally {
      if (provider !== 'Google') {
        setIsProcessing(false);
      }
    }
  };

  return {
    mode,
    isProcessing,
    handleSubmit,
    handleSocialLogin,
    setMode,
  };
};
