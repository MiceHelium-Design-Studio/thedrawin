
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DrawTicketFormProps {
  ticketPrices: number[];
  onSubmit: (number: number, price: number) => Promise<void>;
  loading: boolean;
}

export const DrawTicketForm = ({ ticketPrices, onSubmit, loading }: DrawTicketFormProps) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const { toast } = useToast();

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 100) {
      setSelectedNumber(value);
    }
  };

  const handleSubmit = async () => {
    if (!selectedNumber) {
      toast({
        variant: 'destructive',
        title: 'Number required',
        description: 'Please select a number between 1 and 100.',
      });
      return;
    }
    
    if (!selectedPrice) {
      toast({
        variant: 'destructive',
        title: 'Price required',
        description: 'Please select a ticket price.',
      });
      return;
    }

    await onSubmit(selectedNumber, selectedPrice);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Pick your lucky number:</h3>
        <Input
          type="number"
          min={1}
          max={100}
          placeholder="Enter a number from 1-100"
          value={selectedNumber || ''}
          onChange={handleNumberChange}
          className="border-gold/30 focus:border-gold"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Select ticket price:</h3>
        <RadioGroup 
          onValueChange={(value) => setSelectedPrice(parseInt(value))} 
          className="grid grid-cols-3 gap-3"
        >
          {ticketPrices.map((price) => (
            <div key={price} className="flex items-center space-x-2">
              <RadioGroupItem
                value={price.toString()}
                id={`price-${price}`}
                className="text-gold"
              />
              <Label 
                htmlFor={`price-${price}`}
                className="flex items-center cursor-pointer"
              >
                <Coins className="h-4 w-4 text-gold mr-1" />
                ${price}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={!selectedNumber || !selectedPrice || loading}
        className="w-full bg-gold hover:bg-gold-dark text-black font-medium"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            <span>Processing...</span>
          </div>
        ) : (
          'Purchase Ticket'
        )}
      </Button>
      
      <p className="text-sm text-gray-500 text-center">
        By purchasing a ticket, you agree to the terms and conditions.
      </p>
    </div>
  );
};
