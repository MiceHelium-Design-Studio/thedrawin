import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Google } from 'lucide-react';
import AuthForm from '../components/auth/AuthForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useBackground } from '../context/BackgroundContext';
import { useToast } from '@/components/ui/use-toast';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = Google;

const Auth: React.FC = () => {
  const { user, login, signup, signInWithGoogle, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { authBackgroundImage } = useBackground();
  const [isProcessing, setIsProcessing] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user && !authLoading) {
      console.log("Auth: User is logged in, redirecting to:", from);
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (data: { email: string; password: string; name?: string; phone?: string }) => {
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
        if (user) {
          navigate("/", { replace: true });
        }
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

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'signup' : 'login'));
  };

  if (authLoading && user) {
    return <Navigate to="/" replace />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black/90">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-center p-4 bg-cover bg-center pattern-bg" 
      style={{ 
        backgroundImage: `url(${authBackgroundImage})`,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="max-w-md w-full mx-auto glass-card rounded-xl backdrop-blur-md shadow-lg p-6 my-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent inline-block tracking-tight uppercase">
            THE DRAW WIN 2025
          </h1>
          <div className="h-1 w-24 mx-auto my-3 bg-gold/50 rounded-full"></div>
          <p className="text-sm text-white mt-2 font-light tracking-wide uppercase">
            ENTER DRAWS TO WIN VALUABLE PRIZES
          </p>
        </div>

        <AuthForm mode={mode} onSubmit={handleSubmit} loading={isProcessing} />

        <div className="mt-6">
          <div className="relative flex items-center justify-center">
            <Separator className="bg-gold/20" />
            <span className="px-2 text-xs text-white bg-black/50 relative z-10 font-medium tracking-wider uppercase">OR CONTINUE WITH</span>
          </div>
          
          <div className="flex justify-center space-x-4 mt-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleSocialLogin('Facebook')}
              className="rounded-full hover:bg-black/60"
              disabled={isProcessing}
            >
              <Facebook className="h-5 w-5 text-gold" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleSocialLogin('Twitter')}
              className="rounded-full hover:bg-black/60"
              disabled={isProcessing}
            >
              <Twitter className="h-5 w-5 text-gold" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleSocialLogin('LinkedIn')}
              className="rounded-full hover:bg-black/60"
              disabled={isProcessing}
            >
              <Linkedin className="h-5 w-5 text-gold" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleSocialLogin('Google')}
              className="rounded-full hover:bg-black/60"
              disabled={isProcessing}
            >
              <Suspense fallback={<div className="h-5 w-5 rounded-full animate-pulse bg-gold/30"></div>}>
                <GoogleIcon className="h-5 w-5 text-gold" />
              </Suspense>
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-white mb-2 font-light tracking-wide uppercase">
            {mode === 'login' ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY HAVE AN ACCOUNT?'}
          </p>
          <Button 
            variant="outline" 
            onClick={toggleMode}
            className="text-white hover:text-white border border-gold/30 hover:border-gold/60 bg-black/50 hover:bg-black-light/70 transition-all duration-300 font-medium tracking-wide text-sm uppercase"
            disabled={isProcessing}
          >
            {mode === 'login' ? 'SIGN UP' : 'SIGN IN'}
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-white tracking-wider font-light uppercase">© 2025 THE DRAW WIN</p>
      </div>
    </div>
  );
};

export default Auth;
