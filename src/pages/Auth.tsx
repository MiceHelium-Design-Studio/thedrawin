
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useBackground } from '../context/BackgroundContext';
import { useToast } from '@/components/ui/use-toast';

const Auth: React.FC = () => {
  const { user, loading, login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authBackgroundImage } = useBackground();

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
      } else {
        await signup(data.email, data.password, data.name || '');
      }
      navigate('/');
      toast({
        title: mode === 'login' ? 'Welcome back!' : 'Account created!',
        description: mode === 'login' ? 'You are now signed in.' : 'Your account has been created successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: 'Please check your credentials and try again.',
      });
      console.error(error);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'signup' : 'login'));
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center p-4 bg-cover bg-center pattern-bg" 
      style={{ 
        backgroundImage: `url(${authBackgroundImage})`,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="max-w-md w-full mx-auto glass-card rounded-xl backdrop-blur-md border border-gold/30 shadow-lg p-6 my-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent inline-block">
            The Draw Win 2025
          </h1>
          <div className="h-1 w-20 mx-auto my-3 bg-gold/50 rounded-full"></div>
          <p className="text-gold-light/80 mt-2">
            Enter draws to win valuable prizes
          </p>
        </div>

        <AuthForm mode={mode} onSubmit={handleSubmit} loading={loading} />

        <div className="mt-8 text-center">
          <p className="text-sm text-gold-light/70 mb-2">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Button 
            variant="outline" 
            onClick={toggleMode}
            className="text-gold hover:text-gold-light border border-gold/30 hover:border-gold/60 bg-black/50 hover:bg-black-light/70 transition-all duration-300"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-gold-light/40">© 2025 The Draw Win</p>
      </div>
    </div>
  );
};

export default Auth;
