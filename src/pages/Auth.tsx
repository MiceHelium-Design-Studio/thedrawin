
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
      className="min-h-screen flex flex-col justify-center p-4 bg-cover bg-center" 
      style={{ 
        backgroundImage: `url(${authBackgroundImage})`,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="max-w-md w-full mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 my-8">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold bg-gold-gradient bg-clip-text text-transparent inline-block">
            Gold Coin Raffle
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter draws to win valuable gold coins
          </p>
        </div>

        <AuthForm mode={mode} onSubmit={handleSubmit} loading={loading} />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <Button 
            variant="link" 
            onClick={toggleMode}
            className="text-gold hover:text-gold-dark"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
