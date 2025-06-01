
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Draw } from '@/types';
import { useDraws } from '@/context/DrawContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sendDrawEntryNotifications } from '@/utils/notificationUtils';

interface SelectNumberModalProps {
  draw: Draw;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SelectNumberModal: React.FC<SelectNumberModalProps> = ({ 
  draw, 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [step, setStep] = useState<'number' | 'price'>('number');
  const [takenNumbers, setTakenNumbers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserEntered, setIsUserEntered] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const { buyTicket } = useDraws();
  const { user } = useAuth();

  // Generate numbers 1-100
  const availableNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
  
  // Check if user already has a ticket for this draw and fetch taken numbers
  useEffect(() => {
    const fetchDrawInfo = async () => {
      if (!draw?.id || !user?.id) return;
      
      try {
        // Check if user already entered this draw
        const { data: userEntered, error: userError } = await supabase
          .rpc('user_entered_draw', { 
            draw_uuid: draw.id, 
            user_uuid: user.id 
          });
        
        if (userError) throw userError;
        setIsUserEntered(userEntered);
        
        // Get taken ticket numbers
        const { data: takenNumbersData, error: takenError } = await supabase
          .rpc('get_taken_ticket_numbers', { draw_uuid: draw.id });
        
        if (takenError) throw takenError;
        setTakenNumbers(takenNumbersData || []);

        // Get user's current wallet balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('wallet')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setUserBalance(profileData?.wallet || 0);
      } catch (error) {
        console.error('Error fetching draw info:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching draw information',
          description: 'Please try again later.'
        });
      }
    };
    
    if (isOpen) {
      fetchDrawInfo();
      setStep('number');
      setSelectedNumber(null);
      setSelectedPrice(null);
    }
  }, [draw?.id, user?.id, isOpen]);
  
  const handleNumberClick = (number: number) => {
    setSelectedNumber(number === selectedNumber ? null : number);
  };
  
  const handleNumberConfirm = () => {
    if (selectedNumber) {
      setStep('price');
    }
  };
  
  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price === selectedPrice ? null : price);
  };
  
  const handleSubmit = async () => {
    if (!selectedNumber || !selectedPrice || !draw?.id || !user?.id) return;
    
    // Check if user has sufficient balance
    if (userBalance < selectedPrice) {
      toast({
        variant: 'destructive',
        title: 'Insufficient balance',
        description: `You need $${selectedPrice} but only have $${userBalance}. Please add funds to your wallet.`
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await buyTicket(draw.id, selectedNumber, selectedPrice);
      
      // Send notifications
      await sendDrawEntryNotifications(
        user.id,
        draw.title,
        selectedNumber,
        selectedPrice
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      // Error toast is handled in buyTicket function
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isNumberTaken = (number: number) => takenNumbers.includes(number);

  const handleBack = () => {
    setStep('number');
    setSelectedPrice(null);
  };

  const canAffordPrice = (price: number) => userBalance >= price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isUserEntered 
              ? "You've already entered this draw"
              : step === 'number' 
                ? `Choose Your Lucky Number for ${draw?.title}`
                : `Select Your Entry Price`}
          </DialogTitle>
        </DialogHeader>
        
        {isUserEntered ? (
          <div className="text-center py-6">
            <p>You've already entered this draw with a number. Each user can only enter once.</p>
          </div>
        ) : step === 'number' ? (
          <>
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Your wallet balance:</span> ${userBalance}
              </p>
            </div>
            
            <div className="grid grid-cols-10 gap-2 mt-4">
              {availableNumbers.map((number) => (
                <Button
                  key={number}
                  variant={selectedNumber === number ? "default" : "outline"}
                  className={`h-10 ${
                    isNumberTaken(number)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-primary/20"
                  }`}
                  disabled={isNumberTaken(number)}
                  onClick={() => handleNumberClick(number)}
                >
                  {number}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-primary rounded-sm"></div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-sm"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 opacity-50 rounded-sm"></div>
                <span className="text-sm">Taken</span>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNumberConfirm}
                disabled={!selectedNumber || isSubmitting}
              >
                Next: Choose Price
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="mt-4">
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Your wallet balance:</span> ${userBalance}
                </p>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Selected Number: <span className="font-bold text-primary">#{selectedNumber}</span>
              </p>
              <p className="text-sm font-medium mb-4">Choose your entry price:</p>
              <div className="grid grid-cols-2 gap-3">
                {draw.ticketPrices.map((price) => (
                  <Button
                    key={price}
                    variant={selectedPrice === price ? "default" : "outline"}
                    className={`h-16 flex flex-col ${
                      !canAffordPrice(price) ? "opacity-50" : ""
                    }`}
                    onClick={() => handlePriceSelect(price)}
                    disabled={!canAffordPrice(price)}
                  >
                    <span className="text-lg font-bold">${price}</span>
                    <span className="text-xs">
                      {canAffordPrice(price) ? "Entry Fee" : "Insufficient funds"}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedPrice || !canAffordPrice(selectedPrice || 0) || isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Enter Draw ($${selectedPrice})`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectNumberModal;
