
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWalletManagement } from '@/hooks/useWalletManagement';
import { StatsOverview } from './users/StatsOverview';
import { UserTable } from './users/UserTable';
import { WalletDialog } from './users/WalletDialog';
import { useToast } from '@/hooks/use-toast';

const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    fetchError,
    connectionStatus,
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
  } = useWalletManagement(users, () => fetchUsers());

  useEffect(() => {
    if (connectionStatus === false) {
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Failed to connect to the database. Please check your network and try again.'
      });
    }
  }, [connectionStatus, toast]);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex gap-2">
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Connection
          </Button>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            Refresh List
          </Button>
        </div>
      </div>

      {connectionStatus === false && (
        <div className="bg-destructive/20 text-destructive border border-destructive/50 rounded-md p-4 mb-4">
          <p className="font-medium">Database connection error</p>
          <p className="text-sm">Could not connect to the Supabase database. Please check your network connection and try again.</p>
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
