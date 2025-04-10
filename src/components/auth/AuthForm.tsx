
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Coins } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: { email: string; password: string; name?: string; phone?: string }) => Promise<void>;
  loading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      email, 
      password, 
      ...(mode === 'signup' ? { name, phone } : {}) 
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-8">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-gold/20 p-3 shadow-[0_0_15px_rgba(212,175,55,0.3)] neo-glow">
          <Coins className="h-10 w-10 text-gold" />
        </div>
      </div>
      
      <h2 className="text-2xl font-serif text-center mb-6 text-gold tracking-wider uppercase font-bold">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gold-light font-medium tracking-wide uppercase">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="neo-input font-light"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gold-light font-medium tracking-wide uppercase">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="neo-input font-light"
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gold-light font-medium tracking-wide uppercase">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="neo-input font-light"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gold-light font-medium tracking-wide uppercase">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="neo-input font-light"
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-dark text-black font-medium tracking-wide uppercase mt-8 py-6"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
