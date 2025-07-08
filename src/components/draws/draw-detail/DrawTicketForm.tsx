import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useDraws } from '@/context/DrawContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SelectNumberModal from './SelectNumberModal';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        title: t('draws.messages.loginRequired'),
        description: t('draws.messages.loginRequiredDesc'),
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    // If the draw is not active, show an error message
    if (draw.status !== 'active' && draw.status !== 'open') {
      toast({
        title: t('draws.messages.drawNotAvailable'),
        description: t('draws.messages.drawNotAvailableDesc'),
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
        className="w-full h-12 text-lg font-semibold"
        disabled={loading}
      >
        {loading ? t('draws.detail.processing') : t('draws.detail.enterDrawFull')}
      </Button>
      
      <p className="text-center text-sm text-muted-foreground mt-2">
        {t('draws.detail.selectFromNumbers')}
      </p>
      
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
