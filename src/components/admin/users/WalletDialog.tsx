
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  walletAmount: string;
  onWalletAmountChange: (value: string) => void;
  onAddFunds: () => void;
}

export const WalletDialog: React.FC<WalletDialogProps> = ({
  isOpen,
  onClose,
  walletAmount,
  onWalletAmountChange,
  onAddFunds,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Wallet Funds</DialogTitle>
          <DialogDescription>
            Add credits to the user's wallet balance.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 flex items-center">
              <Input
                id="amount"
                type="text"
                value={walletAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onWalletAmountChange(value);
                }}
                className="flex-1"
              />
              <span className="ml-2 text-sm text-gray-500">credits</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onAddFunds}>Add Funds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
