
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
  isProcessing?: boolean;
}

export const WalletDialog: React.FC<WalletDialogProps> = ({
  isOpen,
  onClose,
  walletAmount,
  onWalletAmountChange,
  onAddFunds,
  isProcessing = false,
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
                disabled={isProcessing}
              />
              <span className="ml-2 text-sm text-gray-500">credits</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={onAddFunds} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Processing...
              </>
            ) : (
              'Add Funds'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
