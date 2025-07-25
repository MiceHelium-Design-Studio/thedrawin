import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useWalletManagement } from '@/hooks/useWalletManagement';
import { StatsOverview } from './users/StatsOverview';
import { UserTable } from './users/UserTable';
import { WalletDialog } from './users/WalletDialog';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UserManagement: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { t } = useTranslation();
  const {
    users,
    loading,
    fetchError,
    connectionStatus,
    connectionErrorDetails,
    fetchUsers,
    toggleAdminStatus,
    sendNotificationToUser,
    testConnection
  } = useUserManagement();
  const {
    toast
  } = useToast();
  const {
    selectedUserId,
    walletAmount,
    isWalletDialogOpen,
    setSelectedUserId,
    setWalletAmount,
    setIsWalletDialogOpen,
    handleAddFunds,
    closeWalletDialog
  } = useWalletManagement(users, fetchUsers);

  useEffect(() => {
    if (connectionStatus === false) {
      toast({
        variant: 'destructive',
        title: t('admin.users.connectionError'),
        description: connectionErrorDetails || t('admin.users.connectionErrorDescription')
      });
    } else if (connectionStatus === true) {
      toast({
        title: t('admin.users.connectionSuccessful'),
        description: t('admin.users.connectionSuccessfulDescription')
      });
    }
  }, [connectionStatus, connectionErrorDetails, toast]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await testConnection();
      // If connection is successful, fetch users
      if (connectionStatus) {
        await fetchUsers();
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  return <section className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-semibold text-white">{t('admin.users.title')}</h2>
      <div className="flex gap-2">
        <Button onClick={fetchUsers} variant="outline" size="sm" disabled={connectionStatus === false || loading}>
          {loading ? <>
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            {t('common.loading')}
          </> : <>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('admin.users.refreshList')}
          </>}
        </Button>
      </div>
    </div>

    {connectionStatus === true && <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800 rounded-md p-3 mb-4">
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <p>{t('admin.users.connectionSuccessMessage')}</p>
      </div>
    </div>}

    {connectionStatus === false}

    {connectionStatus === true && users.length > 0 && <StatsOverview users={users} />}

    <div className="rounded-md border overflow-x-auto">
      <UserTable users={users} loading={loading} fetchError={fetchError} onToggleAdmin={toggleAdminStatus} onSendNotification={sendNotificationToUser} onAddFunds={userId => {
        setSelectedUserId(userId);
        setIsWalletDialogOpen(true);
      }} />
    </div>

    <WalletDialog isOpen={isWalletDialogOpen} onClose={closeWalletDialog} walletAmount={walletAmount} onWalletAmountChange={setWalletAmount} onAddFunds={handleAddFunds} />
  </section>;
};

export default UserManagement;
