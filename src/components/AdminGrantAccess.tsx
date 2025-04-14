
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const AdminGrantAccess: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { forceAdminAccess, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter an email address.',
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatus('idle');
    
    try {
      await forceAdminAccess(email);
      setStatus('success');
      toast({
        title: 'Admin access granted',
        description: `${email} now has admin privileges.`,
      });
      
      // If current user's email matches the granted email, redirect to admin page
      if (user?.email === email) {
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      }
      
      setEmail('');
    } catch (error) {
      console.error('Failed to grant admin access:', error);
      setStatus('error');
      toast({
        variant: 'destructive',
        title: 'Failed to grant admin access',
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantSelfAccess = async () => {
    if (!user?.email) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to grant yourself admin access.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await forceAdminAccess(user.email);
      toast({
        title: 'Admin access granted',
        description: 'You now have admin privileges. Redirecting to admin page...',
      });
      
      // Force a page reload to ensure all permissions are refreshed
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    } catch (error) {
      console.error('Failed to grant self admin access:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to grant admin access',
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Grant Admin Access</CardTitle>
        <CardDescription>
          Provide an email address to grant admin privileges to a user.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black-dark/50 border-gold/30 focus:border-gold"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="flex-1 bg-gold hover:bg-gold-dark text-black font-medium"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Grant Admin Access
            </Button>
            
            <Button 
              type="button"
              onClick={handleGrantSelfAccess}
              disabled={isSubmitting || !user?.email}
              className="flex-1 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30"
            >
              Grant Myself Admin
            </Button>
          </div>
          
          {status === 'success' && (
            <div className="flex items-center text-green-500 bg-green-500/10 p-3 rounded-md">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Admin access granted successfully!</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center text-red-500 bg-red-500/10 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Failed to grant admin access. Please try again.</span>
            </div>
          )}
          
          <div className="text-sm text-gray-400 mt-4">
            <p>
              Note: Only existing users can be granted admin access. After being granted 
              admin privileges, users may need to refresh their browser or re-login for
              the changes to take effect.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminGrantAccess;
