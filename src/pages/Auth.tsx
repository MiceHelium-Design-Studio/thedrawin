
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
import { useTranslation } from 'react-i18next';

const Auth = () => {
  const { user, loading: authLoading, resetPassword } = useAuth();
  const { authBackgroundImage } = useBackground();
  const { 
    mode, 
    isProcessing, 
    handleSubmit, 
    handleSocialLogin, 
    setMode 
  } = useAuthForm();
  const { t } = useTranslation();

  if (authLoading && user) {
    return <Navigate to="/" replace />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0D0D0D] pattern-bg">
        <div className="luxury-fade-in space-y-6 w-full max-w-md">
          <div className="luxury-card h-8 w-3/4 mx-auto"></div>
          <div className="luxury-card h-64"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-800 rounded w-full gold-shimmer"></div>
            <div className="h-4 bg-slate-800 rounded w-2/3 gold-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Premium background effects */}
      <div className="fixed inset-0 pattern-bg pointer-events-none" />
      <div className="fixed inset-0 hero-glow pointer-events-none" />
      
      <div 
        className="min-h-screen flex flex-col justify-center p-4 relative z-10" 
        style={{ 
          backgroundImage: `url(${authBackgroundImage})`,
          backgroundColor: 'rgba(13, 13, 13, 0.95)',
          backgroundBlendMode: 'overlay',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-md w-full mx-auto luxury-card rounded-xl backdrop-blur-xl shadow-luxury p-8 my-8 relative overflow-hidden">
          {/* Subtle animated border */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/20 via-transparent to-[#F39C0A]/20 p-0.5 rounded-xl">
            <div className="bg-[#0D0D0D]/95 w-full h-full rounded-lg" />
          </div>
          
          <div className="relative z-10">
            <AuthHeader />
            <AuthForm 
              mode={mode} 
              onSubmit={handleSubmit} 
              onResetPassword={resetPassword}
              loading={isProcessing} 
            />

            <div className="mt-6">
              <div className="relative flex items-center justify-center">
                <Separator className="bg-[#F39C0A]/20" />
                <span className="px-3 text-xs text-white bg-[#0D0D0D]/90 relative z-10 font-medium tracking-wider uppercase">
                  {t('auth.or')} {t('auth.continueWith')}
                </span>
              </div>
              
              <div className="mt-4">
                <SocialLoginButtons onSocialLogin={handleSocialLogin} isProcessing={isProcessing} />
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-white mb-3 font-medium tracking-wide uppercase">
                {mode === 'login' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="w-full border-[#F39C0A] text-white hover:bg-[#F39C0A] hover:text-black transition-colors"
                disabled={isProcessing}
              >
                {mode === 'login' ? t('auth.signup') : t('auth.login')}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-xs text-white tracking-wider font-light uppercase">© 2025 DRAWIN</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
