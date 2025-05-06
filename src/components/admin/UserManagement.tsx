
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWalletManagement } from '@/hooks/useWalletManagement';
import { StatsOverview } from './users/StatsOverview';
import { UserTable } from './users/UserTable';
import { WalletDialog } from './users/WalletDialog';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const UserManagement: React.FC = () => {
  const {
    users,
    setUsers,
    loading,
    fetchError,
    connectionStatus,
    connectionErrorDetails,
    fetchUsers,
    toggleAdminStatus,
    sendNotificationToUser,
    testConnection
  } = useUserManagement();

  const { toast } = useToast();

  const {
    selectedUserId,
    walletAmount,
    isWalletDialogOpen,
    setSelectedUserId,
    setWalletAmount,
    setIsWalletDialogOpen,
    handleAddFunds,
    closeWalletDialog
  } = useWalletManagement(users, fetchUsers); // Pass fetchUsers as the callback

  useEffect(() => {
    if (connectionStatus === false) {
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: connectionErrorDetails || 'Failed to connect to the database. Please check your network and try again.'
      });
    }
  }, [connectionStatus, connectionErrorDetails, toast]);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex gap-2">
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Connection
          </Button>
          <Button onClick={fetchUsers} variant="outline" size="sm" disabled={connectionStatus === false}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh List
          </Button>
        </div>
      </div>

      {connectionStatus === false && (
        <div className="bg-destructive/20 text-destructive border border-destructive/50 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Database connection error</p>
              <p className="text-sm mt-1">{connectionErrorDetails || 'Could not connect to the Supabase database. Please check your network connection and try again.'}</p>
              {connectionErrorDetails && connectionErrorDetails.includes('infinite recursion') && (
                <div className="mt-2 text-sm p-2 bg-destructive/10 rounded">
                  <p className="font-medium">Suggested Fix:</p>
                  <p>This appears to be a Row Level Security (RLS) policy issue in the database. The policies on the profiles table may have a circular reference causing infinite recursion.</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={testConnection} className="mr-2">
              Test Again
            </Button>
          </div>
        </div>
      )}

      {connectionStatus === true && users.length > 0 && (
        <StatsOverview users={users} />
      )}

      <div className="rounded-md border overflow-x-auto">
        <UserTable
          users={users}
          loading={loading}
          fetchError={fetchError}
          onToggleAdmin={toggleAdminStatus}
          onSendNotification={sendNotificationToUser}
          onAddFunds={(userId) => {
            setSelectedUserId(userId);
            setIsWalletDialogOpen(true);
          }}
        />
      </div>

      <WalletDialog
        isOpen={isWalletDialogOpen}
        onClose={closeWalletDialog}
        walletAmount={walletAmount}
        onWalletAmountChange={setWalletAmount}
        onAddFunds={handleAddFunds}
      />
    </section>
  );
};

export default UserManagement;
