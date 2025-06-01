
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Banknote, Ticket } from 'lucide-react';

interface DrawTicketFormProps {
  ticketPrices: number[];
  onSubmit: (number: number, price: number) => void;
  loading: boolean;
}

export const DrawTicketForm: React.FC<DrawTicketFormProps> = ({
  ticketPrices,
  onSubmit,
  loading
}) => {
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [selectedPrice] = useState(ticketPrices[0] || 10); // Use first price as default

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const number = parseInt(selectedNumber);
    if (isNaN(number) || number < 1 || number > 999999) {
      return;
    }
    
    onSubmit(number, selectedPrice);
  };

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 999999) + 1;
    setSelectedNumber(randomNum.toString());
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Enter the Draw
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ticket-number">Choose Your Lucky Number (1-999999)</Label>
            <div className="flex gap-2">
              <Input
                id="ticket-number"
                type="number"
                min="1"
                max="999999"
                value={selectedNumber}
                onChange={(e) => setSelectedNumber(e.target.value)}
                placeholder="Enter your lucky number"
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateRandomNumber}
                className="whitespace-nowrap"
              >
                Random
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Choose a number between 1 and 999,999 for your entry
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              <span className="font-medium">Entry Price:</span>
            </div>
            <span className="text-xl font-bold text-green-600">
              ${selectedPrice}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !selectedNumber}
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Ticket className="h-4 w-4 mr-2" />
                Enter Draw with Number {selectedNumber || '___'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
