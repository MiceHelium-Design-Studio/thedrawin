
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Draw } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SelectNumberModal from './SelectNumberModal';

interface DrawTicketFormProps {
  draw: Draw;
  onPurchaseSuccess?: () => void;
}

const DrawTicketForm: React.FC<DrawTicketFormProps> = ({ draw, onPurchaseSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isNumberModalOpen, setIsNumberModalOpen] = useState(false);

  const handleEnterDraw = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to enter this draw",
        variant: "default",
      });
      navigate('/login');
      return;
    }

    // If the draw is not active, show an error message
    if (draw.status !== 'active' && draw.status !== 'open') {
      toast({
        title: "Draw not available",
        description: "This draw is not currently accepting entries",
        variant: "destructive",
      });
      return;
    }

    setIsNumberModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    if (onPurchaseSuccess) {
      onPurchaseSuccess();
    }
  };

  return (
    <div className="w-full">
      <Button 
        onClick={handleEnterDraw} 
        className="w-full"
      >
        Enter Draw
      </Button>
      
      <SelectNumberModal
        draw={draw}
        isOpen={isNumberModalOpen}
        onClose={() => setIsNumberModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};

export default DrawTicketForm;
