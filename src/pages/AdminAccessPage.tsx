
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminAccessPage: React.FC = () => {
  const { user, forceAdminAccess } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        description: 'You now have admin privileges. The page will refresh in a moment.',
      });
      
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
        <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Grant yourself admin privileges to access the admin area.
        </p>
      </div>
      
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Grant Admin Access</CardTitle>
          <CardDescription>
            Click the button below to grant yourself admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-yellow-400 mb-4">
            <p className="font-medium">Current user: {user?.email || 'Not logged in'}</p>
          </div>
          
          <Button 
            onClick={handleGrantAccess}
            disabled={isSubmitting || !user?.email}
            className="w-full bg-gold hover:bg-gold-dark text-black font-medium"
          >
            {isSubmitting ? 'Processing...' : 'Grant Myself Admin Access'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAccessPage;
