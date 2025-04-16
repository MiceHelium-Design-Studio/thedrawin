
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDraws } from '../context/DrawContext';
import { useToast } from '@/components/ui/use-toast';

const DrawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { draws, buyTicket, loading } = useDraws();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  
  const draw = draws.find(d => d.id === id);
  
  if (!draw) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p>Draw not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  
  const progress = (draw.currentParticipants / draw.maxParticipants) * 100;
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 100) {
      setSelectedNumber(value);
    }
  };
  
  const handlePriceChange = (value: string) => {
    setSelectedPrice(parseInt(value));
  };
  
  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
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
    
    try {
      await buyTicket(draw.id, selectedNumber, selectedPrice);
      toast({
        title: 'Ticket purchased!',
        description: `You've entered the draw with number ${selectedNumber}.`,
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Purchase failed',
        description: 'There was an error purchasing your ticket.',
      });
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')} 
        className="mb-4 pl-0 flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
      
      <Card className="overflow-hidden">
        {draw.bannerImage && (
          <div className="h-48 bg-gray-100">
            <img
              src={draw.bannerImage}
              alt={draw.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        <CardContent className="p-4">
          <h1 className="text-2xl font-bold mb-2">{draw.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{draw.description}</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{draw.currentParticipants} of {draw.maxParticipants} entries</span>
              <span>
                Ends {formatDistanceToNow(new Date(draw.endDate), { addSuffix: true })}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2" 
              label={`${draw.title} entries progress: ${draw.currentParticipants} of ${draw.maxParticipants}`}
            />
          </div>
          
          {draw.status === 'active' && (
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
                  onValueChange={handlePriceChange} 
                  className="grid grid-cols-3 gap-3"
                >
                  {draw.ticketPrices.map((price) => (
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
          )}
          
          {draw.status !== 'active' && (
            <div className="text-center py-6">
              <p className="text-lg font-medium mb-2">
                {draw.status === 'completed'
                  ? 'This draw has ended'
                  : 'This draw has not started yet'}
              </p>
              {draw.status === 'completed' && draw.winner && (
                <div className="mt-4">
                  <h3 className="text-sm text-gray-500">Winner</h3>
                  <p className="text-gold text-xl font-bold">{draw.winner}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawDetail;
