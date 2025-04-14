
import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const AdminAccessPage: React.FC = () => {
  const { user, forceAdminAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if user is already an admin
  useEffect(() => {
    if (user?.isAdmin) {
      setSuccess(true);
    }
  }, [user]);

  const handleGrantAccess = async () => {
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
        description: 'You now have full administrator privileges.',
      });
      
      setSuccess(true);
      
      // Force a page reload after a delay to ensure all state is refreshed
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error('Failed to grant admin access:', error);
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
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-gold mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-white mb-2">Administrator Access</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Grant yourself full administrator privileges to access all system features.
        </p>
      </div>
      
      <Card className="mx-auto max-w-lg bg-black/50 border-gold/20">
        <CardHeader>
          <CardTitle className="text-xl text-gold">Administrator Access Control</CardTitle>
          <CardDescription>
            Click the button below to grant yourself full administrator privileges.
          </CardDescription>
          <Separator className="bg-gold/20 my-2" />
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-400 mb-4">
            <p className="font-medium">Current user: {user?.email || 'Not logged in'}</p>
            <p className="text-sm mt-1">Admin status: {user?.isAdmin ? 'Administrator' : 'Regular User'}</p>
          </div>
          
          {success ? (
            <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/30 rounded-md">
              <Check className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-center text-green-400 font-medium">Administrator privileges granted!</p>
              <Button 
                onClick={() => navigate('/admin')}
                className="mt-4 w-full bg-gold hover:bg-gold-dark text-black font-medium"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleGrantAccess}
              disabled={isSubmitting || !user?.email}
              className="w-full bg-gold hover:bg-gold-dark text-black font-medium"
            >
              {isSubmitting ? 'Granting Access...' : 'Grant Full Administrator Access'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAccessPage;
