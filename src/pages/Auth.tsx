
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useBackground } from '@/context/BackgroundContext';
import { Separator } from '@/components/ui/separator';
import AuthForm from '../components/auth/AuthForm';
import AuthHeader from '../components/auth/AuthHeader';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import { useAuthForm } from '@/hooks/useAuthForm';

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const { authBackgroundImage } = useBackground();
  const { 
    mode, 
    isProcessing, 
    handleSubmit, 
    handleSocialLogin, 
    setMode 
  } = useAuthForm();

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
        <AuthHeader />
        <AuthForm mode={mode} onSubmit={handleSubmit} loading={isProcessing} />

        <div className="mt-6">
          <div className="relative flex items-center justify-center">
            <Separator className="bg-gold/20" />
            <span className="px-2 text-xs text-white bg-black/50 relative z-10 font-medium tracking-wider uppercase">
              OR CONTINUE WITH
            </span>
          </div>
          
          <div className="mt-4">
            <SocialLoginButtons onSocialLogin={handleSocialLogin} isProcessing={isProcessing} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-white mb-2 font-light tracking-wide uppercase">
            {mode === 'login' ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY HAVE AN ACCOUNT?'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
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
