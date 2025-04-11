
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useBackground } from '../context/BackgroundContext';
import { useToast } from '@/components/ui/use-toast';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Auth: React.FC = () => {
  const { user, loading, login, signup, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authBackgroundImage } = useBackground();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirect if user is already logged in or login was successful
  useEffect(() => {
    if (user) {
      // Use a small delay to allow the toast to be shown before redirect
      const timer = setTimeout(() => {
        navigate('/');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // If we're still in loading state, don't render anything yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  const handleSubmit = async (data: { email: string; password: string; name?: string; phone?: string }) => {
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
      } else {
        await signup(data.email, data.password, data.name || '', data.phone);
      }
      
      toast({
        title: mode === 'login' ? 'Welcome back!' : 'Account created!',
        description: mode === 'login' ? 'You are now signed in.' : 'Your account has been created successfully.',
      });
      
      setLoginSuccess(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: 'Please check your credentials and try again.',
      });
      console.error(error);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      if (provider === 'Google') {
        await signInWithGoogle();
        // The redirect will be handled by Supabase, so no need to navigate here
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
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'signup' : 'login'));
  };

  // Redirect if user is logged in
  if (user || loginSuccess) {
    return <Navigate to="/" />;
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

        <AuthForm mode={mode} onSubmit={handleSubmit} loading={loading} />

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
            >
              <Facebook className="h-5 w-5 text-gold" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleSocialLogin('Twitter')}
              className="rounded-full hover:bg-black/60"
            >
              <Twitter className="h-5 w-5 text-gold" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleSocialLogin('LinkedIn')}
              className="rounded-full hover:bg-black/60"
            >
              <Linkedin className="h-5 w-5 text-gold" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleSocialLogin('Google')}
              className="rounded-full hover:bg-black/60"
            >
              <Mail className="h-5 w-5 text-gold" />
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
