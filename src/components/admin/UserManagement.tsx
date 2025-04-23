
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { StatsCard } from './stats/StatsCard';
import { UserTable } from './users/UserTable';
import { WalletDialog } from './users/WalletDialog';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState<string>('100');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      const mappedUsers = profilesData?.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name || undefined,
        avatar: profile.avatar || undefined,
        wallet: profile.wallet || 0,
        isAdmin: profile.is_admin || false,
        createdAt: profile.created_at
      })) || [];
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: 'There was a problem loading the user list. Please try again later.'
      });
      
      setUsers([]);
      setFetchError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
      
      toast({
        title: 'Status updated',
        description: `Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully.`
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was a problem updating the admin status.'
      });
    }
  };

  const sendNotificationToUser = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message: 'Welcome to Gold Drawin! We hope you enjoy our platform.',
          type: 'system'
        });
      
      if (error) throw error;
      
      toast({
        title: 'Notification sent',
        description: `Welcome message sent to ${email}`
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Notification failed',
        description: 'There was a problem sending the notification.'
      });
    }
  };

  const handleAddFunds = async () => {
    if (!selectedUserId || !walletAmount || parseInt(walletAmount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount to add.'
      });
      return;
    }

    try {
      const userToUpdate = users.find(u => u.id === selectedUserId);
      
      if (!userToUpdate) {
        throw new Error('User not found');
      }

      const newWalletAmount = userToUpdate.wallet + parseInt(walletAmount);
      
      const { error } = await supabase
        .from('profiles')
        .update({ wallet: newWalletAmount })
        .eq('id', selectedUserId);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === selectedUserId ? { ...user, wallet: newWalletAmount } : user
      ));
      
      toast({
        title: 'Wallet updated',
        description: `Added ${walletAmount} credits to user's wallet.`
      });
      
      closeWalletDialog();
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was a problem updating the wallet.'
      });
    }
  };

  const closeWalletDialog = () => {
    setSelectedUserId(null);
    setWalletAmount('100');
    setIsWalletDialogOpen(false);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh List
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          description="Number of registered users"
          value={users.length}
        />
        <StatsCard
          title="Admins"
          description="Users with admin privileges"
          value={users.filter(user => user.isAdmin).length}
        />
        <StatsCard
          title="Regular Users"
          description="Users without admin privileges"
          value={users.filter(user => !user.isAdmin).length}
        />
        <StatsCard
          title="Total Balance"
          description="Combined wallet balances"
          value={users.reduce((total, user) => total + (user.wallet || 0), 0)}
        />
      </div>

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
