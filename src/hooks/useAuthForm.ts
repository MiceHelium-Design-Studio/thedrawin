
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
    try {
      setIsProcessing(true);
      if (mode === 'login') {
        await login(data.email, data.password);
        toast({
          title: 'Welcome back!',
          description: 'You are now signed in.',
        });
        navigate("/", { replace: true });
      } else {
        await signup(data.email, data.password, data.name || '', data.phone);
        toast({
          title: 'Account created!',
          description: 'Your account has been created successfully.',
        });
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: 'Please check your credentials and try again.',
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsProcessing(true);
      if (provider === 'Google') {
        await signInWithGoogle();
      } else {
        toast({
          title: 'Social login',
          description: `${provider} login is not implemented yet.`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `${provider} login failed`,
        description: 'An error occurred during login.',
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
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
