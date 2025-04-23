
import React from 'react';
import { Button } from '@/components/ui/button';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWalletManagement } from '@/hooks/useWalletManagement';
import { StatsOverview } from './users/StatsOverview';
import { UserTable } from './users/UserTable';
import { WalletDialog } from './users/WalletDialog';

const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    fetchError,
    fetchUsers,
    toggleAdminStatus,
    sendNotificationToUser
  } = useUserManagement();

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

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh List
        </Button>
      </div>

      <StatsOverview users={users} />

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
