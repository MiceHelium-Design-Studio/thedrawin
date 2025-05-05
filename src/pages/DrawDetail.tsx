import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDraws } from '../context/DrawContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DrawHeader } from '@/components/draws/draw-detail/DrawHeader';
import { DrawProgress } from '@/components/draws/draw-detail/DrawProgress';
import { DrawTicketForm } from '@/components/draws/draw-detail/DrawTicketForm';
import { DrawComplete } from '@/components/draws/draw-detail/DrawComplete';

const DrawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { draws, buyTicket, loading } = useDraws();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const handleBuyTicket = async (number: number, price: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await buyTicket(draw.id, number, price);
      
      toast({
        title: 'Ticket purchased!',
        description: `You've entered the ${draw.title} draw with number ${number}.`,
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
      <DrawHeader
        title={draw.title}
        description={draw.description}
        bannerImage={draw.bannerImage}
      />
      
      <DrawProgress
        currentParticipants={draw.currentParticipants}
        maxParticipants={draw.maxParticipants}
        endDate={draw.endDate}
        title={draw.title}
      />
      
      {draw.status === 'active' ? (
        <DrawTicketForm
          ticketPrices={draw.ticketPrices}
          onSubmit={handleBuyTicket}
          loading={loading}
        />
      ) : (
        <DrawComplete 
          status={draw.status} 
          winner={draw.winner}
        />
      )}
    </div>
  );
};

export default DrawDetail;
