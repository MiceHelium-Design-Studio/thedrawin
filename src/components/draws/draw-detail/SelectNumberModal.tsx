
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Draw } from '@/types';
import { useDraws } from '@/context/DrawContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [takenNumbers, setTakenNumbers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserEntered, setIsUserEntered] = useState(false);
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
    }
  }, [draw?.id, user?.id, isOpen]);
  
  const handleNumberClick = (number: number) => {
    setSelectedNumber(number === selectedNumber ? null : number);
  };
  
  const handleSubmit = async () => {
    if (!selectedNumber || !draw?.id) return;
    
    try {
      setIsSubmitting(true);
      await buyTicket(draw.id, selectedNumber);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast({
        variant: 'destructive',
        title: 'Error entering draw',
        description: 'Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isNumberTaken = (number: number) => takenNumbers.includes(number);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isUserEntered 
              ? "You've already entered this draw"
              : `Choose Your Lucky Number for ${draw?.title}`}
          </DialogTitle>
        </DialogHeader>
        
        {isUserEntered ? (
          <div className="text-center py-6">
            <p>You've already entered this draw with a number. Each user can only enter once.</p>
          </div>
        ) : (
          <>
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
                onClick={handleSubmit}
                disabled={!selectedNumber || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Confirm Number"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectNumberModal;
