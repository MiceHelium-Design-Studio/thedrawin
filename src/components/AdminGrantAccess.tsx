
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminGrantAccess: React.FC = () => {
  const { forceAdminAccess, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const handleGrantAccess = async () => {
    setIsProcessing(true);
    try {
      await forceAdminAccess('raghidhilal@gmail.com');
      setIsComplete(true);
    } catch (error) {
      console.error('Error granting admin access:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateToAdmin = () => {
    navigate('/admin');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Grant Admin Access</CardTitle>
        <CardDescription>
          Grant admin privileges to raghidhilal@gmail.com
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isComplete ? (
          <div className="text-center p-4">
            <div className="text-lg font-medium text-green-600 mb-4">
              ✓ Admin access granted successfully!
            </div>
            <p className="text-sm text-gray-500 mb-4">
              The user raghidhilal@gmail.com now has admin privileges.
            </p>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-sm text-gray-500 mb-4">
              Click the button below to grant admin access to raghidhilal@gmail.com
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        {!isComplete ? (
          <Button 
            onClick={handleGrantAccess} 
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Grant Admin Access'
            )}
          </Button>
        ) : (
          <Button 
            onClick={navigateToAdmin}
            className="bg-gold hover:bg-gold/90 text-black"
          >
            Go to Admin Page
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AdminGrantAccess;
