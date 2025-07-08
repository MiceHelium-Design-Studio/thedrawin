
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => Promise<void>;
  loading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  loading
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const validateForm = () => {
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
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log(`Submitting ${mode} form for:`, email);
      await onSubmit({
        email,
        password,
        ...(mode === 'signup' ? {
          name,
          phone
        } : {})
      });
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError(error.message || t('errors.general'));
    }
  };

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
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={6}
            className="bg-white text-black placeholder:text-gray-600 border-gray-300 focus:border-[#F39C0A] focus:ring-[#F39C0A]/20" 
          />
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
            <span className="text-black">{mode === 'login' ? t('auth.login') : t('auth.signup')}</span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
