
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  DollarSign, 
  CreditCard, 
  ArrowLeftRight, 
  Building, 
  Banknote,
  Bitcoin
} from 'lucide-react';
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

type PaymentMethod = 'regular' | 'card' | 'whish' | 'western-union' | 'usdt';

interface WalletSectionProps {
  user: User | null;
  loading: boolean;
  addFunds: (amount: number) => Promise<void>;
}

const WalletSection: React.FC<WalletSectionProps> = ({ user, loading, addFunds }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('regular');
  const [showCryptoDetails, setShowCryptoDetails] = useState(false);
  const [cryptoAddress, setCryptoAddress] = useState('');
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      paymentMethod: 'regular'
    }
  });
  
  if (!user) return null;
  
  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
      });
      return;
    }
    
    if (paymentMethod === 'usdt') {
      setShowCryptoDetails(true);
      return;
    }
    
    try {
      await addFunds(Number(amount));
      setAmount('');
      toast({
        title: 'Funds added',
        description: `$${amount} has been added to your wallet using ${getPaymentMethodLabel(paymentMethod)}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction failed',
        description: 'There was an error adding funds.',
      });
      console.error(error);
    }
  };

  const handleCryptoPaymentConfirm = async () => {
    if (!cryptoAddress || cryptoAddress.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Invalid transaction hash',
        description: 'Please enter a valid transaction hash.',
      });
      return;
    }
    
    try {
      await addFunds(Number(amount));
      setAmount('');
      setCryptoAddress('');
      setShowCryptoDetails(false);
      
      toast({
        title: 'Crypto payment confirmed',
        description: `$${amount} has been added to your wallet using USDT.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction verification failed',
        description: 'There was an error verifying your crypto transaction.',
      });
      console.error(error);
    }
  };
  
  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'whish':
        return 'Whish Money Transfer';
      case 'western-union':
        return 'Western Union / OMT';
      case 'usdt':
        return 'USDT (Tether)';
      default:
        return 'Regular Payment';
    }
  };
  
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-5 w-5 text-gold" />;
      case 'whish':
        return <ArrowLeftRight className="h-5 w-5 text-gold" />;
      case 'western-union':
        return <Building className="h-5 w-5 text-gold" />;
      case 'usdt':
        return <Bitcoin className="h-5 w-5 text-gold" />;
      default:
        return <Banknote className="h-5 w-5 text-gold" />;
    }
  };
  
  const cryptoInstructions = (
    <div className="mt-4 p-4 border border-gold/30 rounded-md bg-black-light/20">
      <h3 className="font-semibold mb-2">USDT Payment Instructions</h3>
      <p className="text-sm mb-4">Send USDT to the following address:</p>
      
      <div className="bg-black-light/30 p-3 rounded-md mb-4 break-all font-mono text-xs">
        TUr9RRmcMSvEdrxZsXLjn5YhwTX5KKx2WD
      </div>
      
      <div className="space-y-4 mb-4">
        <div>
          <Label htmlFor="txhash" className="text-sm">Transaction Hash</Label>
          <Input
            id="txhash"
            value={cryptoAddress}
            onChange={(e) => setCryptoAddress(e.target.value)}
            placeholder="Enter your transaction hash"
            className="border-gold/30 focus:border-gold mt-1"
          />
          <p className="text-xs text-gray-400 mt-1">
            After sending the payment, paste the transaction hash here to verify your payment.
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handleCryptoPaymentConfirm}
          disabled={!cryptoAddress}
          className="bg-gold hover:bg-gold-dark text-black"
        >
          Confirm Payment
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowCryptoDetails(false)}
          className="border-gold/30 text-gold hover:text-gold-dark"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-gold" />
          Wallet Balance
        </h2>
        <div className="text-2xl font-bold text-gold">${user.wallet.toFixed(2)}</div>
      </div>
      
      {!showCryptoDetails ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Add Funds</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10 border-gold/30 focus:border-gold"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setAmount('5')}
              className="border-gold/30 text-gold hover:text-gold-dark"
            >
              $5
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setAmount('10')}
              className="border-gold/30 text-gold hover:text-gold-dark"
            >
              $10
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setAmount('20')}
              className="border-gold/30 text-gold hover:text-gold-dark"
            >
              $20
            </Button>
          </div>
          
          <div>
            <Label>Payment Method</Label>
            <Form {...form}>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3 mt-2">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value: PaymentMethod) => {
                          setPaymentMethod(value);
                          field.onChange(value);
                        }}
                        value={paymentMethod}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                          <FormLabel className="cursor-pointer flex items-center gap-2">
                            <RadioGroupItem value="regular" className="text-gold" />
                            <Banknote className="h-5 w-5 text-gold" />
                            <span>Bank Transfer</span>
                          </FormLabel>
                        </div>
                        
                        <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                          <FormLabel className="cursor-pointer flex items-center gap-2">
                            <RadioGroupItem value="card" className="text-gold" />
                            <CreditCard className="h-5 w-5 text-gold" />
                            <span>Visa/Mastercard</span>
                          </FormLabel>
                        </div>
                        
                        <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                          <FormLabel className="cursor-pointer flex items-center gap-2">
                            <RadioGroupItem value="whish" className="text-gold" />
                            <ArrowLeftRight className="h-5 w-5 text-gold" />
                            <span>Whish Money Transfer</span>
                          </FormLabel>
                        </div>
                        
                        <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors">
                          <FormLabel className="cursor-pointer flex items-center gap-2">
                            <RadioGroupItem value="western-union" className="text-gold" />
                            <Building className="h-5 w-5 text-gold" />
                            <span>Western Union / OMT</span>
                          </FormLabel>
                        </div>
                        
                        <div className="border border-gold/30 rounded-md p-4 hover:bg-black-light/30 cursor-pointer transition-colors col-span-1 md:col-span-2">
                          <FormLabel className="cursor-pointer flex items-center gap-2">
                            <RadioGroupItem value="usdt" className="text-gold" />
                            <Bitcoin className="h-5 w-5 text-gold" />
                            <span>USDT (Tether)</span>
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
          </div>
          
          <Button
            onClick={handleAddFunds}
            disabled={loading || !amount}
            className="w-full bg-gold hover:bg-gold-dark text-black"
          >
            {getPaymentMethodIcon(paymentMethod)}
            Pay with {getPaymentMethodLabel(paymentMethod)}
          </Button>
        </div>
      ) : (
        cryptoInstructions
      )}
    </>
  );
};

export default WalletSection;
