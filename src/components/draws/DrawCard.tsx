import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Draw } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Coins, Image } from 'lucide-react';

interface DrawCardProps {
  draw: Draw;
}

const DrawCard: React.FC<DrawCardProps> = ({ draw }) => {
  const navigate = useNavigate();
  const defaultImage = "https://images.unsplash.com/photo-1610375461246-83df859d849d";
  
  const progress = (draw.currentParticipants / draw.maxParticipants) * 100;
  
  const getStatusBadge = () => {
    switch (draw.status) {
      case 'active':
        return <Badge className="bg-gold text-black">Active</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="border-gold/50 text-gold">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-black-light border border-gold/20 text-gold-light">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const timeLeft = () => {
    if (draw.status === 'completed') return 'Ended';
    return `Ends ${formatDistanceToNow(new Date(draw.endDate), { addSuffix: true })}`;
  };

  const handleClick = () => {
    navigate(`/draw/${draw.id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load draw image:', {
      drawId: draw.id,
      imageUrl: draw.bannerImage,
      errorEvent: e
    });
    
    e.currentTarget.src = defaultImage;
    e.currentTarget.className = e.currentTarget.className + ' opacity-80 bg-gradient-to-r from-gold/10 to-black';
  };

  return (
    <Card className="hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 border-gold/20 bg-black-light overflow-hidden">
      <div className="h-32 w-full bg-black-light relative">
        <img
          src={draw.bannerImage || defaultImage}
          alt={draw.title}
          className="h-full w-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        {draw.status === 'completed' && draw.winner && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center bg-black/80 px-4 py-3 rounded-lg border border-gold/30 backdrop-blur-sm">
              <h3 className="text-gold-light font-bold text-sm uppercase tracking-wider">Winner</h3>
              <p className="text-gold text-base font-semibold">{draw.winner}</p>
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2 pt-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base text-gold">{draw.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gold-light font-medium text-xs mb-3">{draw.description}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-gold-light">{draw.currentParticipants} of {draw.maxParticipants} entries</span>
            <span className="text-gold font-semibold">{timeLeft()}</span>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2 bg-black border border-gold/10" 
            indicatorClassName="bg-gradient-to-r from-gold-dark to-gold"
            label={`${draw.title} entries progress: ${draw.currentParticipants} of ${draw.maxParticipants}`}
          />
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center">
              <Coins className="h-4 w-4 text-gold mr-1" />
              <span className="text-xs text-gold-light font-medium">
                {draw.ticketPrices.length > 1
                  ? `$${Math.min(...draw.ticketPrices)} - $${Math.max(...draw.ticketPrices)}`
                  : `$${draw.ticketPrices[0]}`}
              </span>
            </div>
            
            <Button
              onClick={handleClick}
              className={`px-4 text-xs ${
                draw.status === 'completed'
                  ? 'bg-black-light border border-gold/20 text-gold-light hover:bg-black hover:border-gold/30'
                  : 'bg-gold hover:bg-gold-dark text-black font-semibold'
              }`}
              disabled={draw.status === 'completed'}
              aria-label={draw.status === 'completed' ? 'View completed draw details' : `Enter ${draw.title} draw`}
            >
              {draw.status === 'completed' ? 'Completed' : 'Enter Draw'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrawCard;
