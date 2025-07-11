
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useWalletManagement = (users: User[], onUserUpdated: () => void) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState<string>('100');
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { toast } = useToast();

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
      
      toast({
        title: 'Wallet updated',
        description: `Added $${walletAmount} to user's wallet. New balance: $${newWalletAmount}`
      });
      
      // Call the callback to refetch users instead of trying to update the state directly
      onUserUpdated();
      
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

  return {
    selectedUserId,
    walletAmount,
    isWalletDialogOpen,
    setSelectedUserId,
    setWalletAmount,
    setIsWalletDialogOpen,
    handleAddFunds,
    closeWalletDialog
  };
};
