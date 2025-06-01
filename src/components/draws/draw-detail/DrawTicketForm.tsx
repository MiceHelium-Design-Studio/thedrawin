
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useDraws } from '@/context/DrawContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SelectNumberModal from './SelectNumberModal';

interface DrawTicketFormProps {
  ticketPrices: number[];
  onSubmit: (number: number, price: number) => Promise<void>;
  loading: boolean;
}

const DrawTicketForm: React.FC<DrawTicketFormProps> = ({ ticketPrices, onSubmit, loading }) => {
  const { user } = useAuth();
  const { draws } = useDraws();
  const navigate = useNavigate();
  const [isNumberModalOpen, setIsNumberModalOpen] = useState(false);

  // Get the current draw from the URL or use the first available draw
  const currentDrawId = window.location.pathname.split('/').pop();
  const draw = draws.find(d => d.id === currentDrawId) || draws[0] || {
    id: '1',
    title: 'Sample Draw',
    description: 'Sample draw description',
    maxParticipants: 100,
    currentParticipants: 0,
    ticketPrices: ticketPrices,
    status: 'active' as const,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  const handleEnterDraw = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to enter this draw",
        variant: "default",
      });
      navigate('/auth');
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
    setIsNumberModalOpen(false);
    // Optionally refresh the page or navigate
    window.location.reload();
  };

  return (
    <div className="w-full">
      <Button 
        onClick={handleEnterDraw} 
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pick Your Number & Enter Draw'}
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
