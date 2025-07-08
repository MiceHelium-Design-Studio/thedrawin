import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDraws } from '../context/DrawContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DrawHeader } from '@/components/draws/draw-detail/DrawHeader';
import { DrawProgress } from '@/components/draws/draw-detail/DrawProgress';
import DrawTicketForm from '@/components/draws/draw-detail/DrawTicketForm';
import DrawComplete from '@/components/draws/draw-detail/DrawComplete';
import { useTranslation } from 'react-i18next';

const DrawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { draws, buyTicket, loading } = useDraws();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const draw = draws.find(d => d.id === id);
  
  // Default image in case the draw doesn't have one
  const defaultBannerImage = "https://images.unsplash.com/photo-1610375461246-83df859d849d";
  
  if (!draw) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p>{t('draws.detail.notFound')}</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          {t('draws.detail.goBack')}
        </Button>
      </div>
    );
  }

  const handleBuyTicket = async (number: number, price: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Call buyTicket with the draw ID, number, and price
      await buyTicket(draw.id, number, price);
      
      toast({
        title: t('draws.modal.entrySuccessful'),
        description: t('draws.modal.entrySuccessfulDesc', { title: draw.title, number, price }),
      });
      
      navigate('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('draws.messages.entryFailed'),
        description: t('draws.messages.entryFailedDesc'),
      });
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <DrawHeader
        title={draw.title}
        description={draw.description}
        bannerImage={draw.bannerImage || defaultBannerImage}
      />
      
      <DrawProgress
        currentParticipants={draw.currentParticipants}
        maxParticipants={draw.maxParticipants}
        endDate={draw.endDate}
        title={draw.title}
      />
      
      {(draw.status === 'active' || draw.status === 'open') ? (
        <DrawTicketForm
          ticketPrices={draw.ticketPrices}
          onSubmit={handleBuyTicket}
          loading={loading}
        />
      ) : (
        <DrawComplete 
          status={draw.status} 
          winner={draw.winner}
          winnerTicketNumber={draw.winnerTicketNumber}
          title={draw.title}
          endDate={draw.endDate}
        />
      )}
    </div>
  );
};

export default DrawDetail;
