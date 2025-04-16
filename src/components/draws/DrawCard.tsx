
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Draw } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';

interface DrawCardProps {
  draw: Draw;
}

const DrawCard: React.FC<DrawCardProps> = ({ draw }) => {
  const navigate = useNavigate();
  
  const progress = (draw.currentParticipants / draw.maxParticipants) * 100;
  
  const getStatusBadge = () => {
    switch (draw.status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
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

  // Enhanced image error handling with detailed logging
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load draw image:', {
      drawId: draw.id,
      imageUrl: draw.bannerImage,
      errorEvent: e
    });
    
    // Apply fallback image and styling
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.className = e.currentTarget.className + ' opacity-50';
    
    // Add error indication
    const parent = e.currentTarget.parentElement;
    if (parent) {
      const errorIndicator = document.createElement('div');
      errorIndicator.className = 'absolute bottom-0 left-0 right-0 bg-red-500/70 text-white text-xs p-1 text-center';
      errorIndicator.innerText = 'Image failed to load';
      
      // Only add if it doesn't exist already
      if (!parent.querySelector('.image-error-indicator')) {
        errorIndicator.classList.add('image-error-indicator');
        parent.appendChild(errorIndicator);
      }
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-gold/20 overflow-hidden">
      {draw.bannerImage && (
        <div className="h-32 w-full bg-gray-100 relative">
          <img
            src={draw.bannerImage}
            alt={draw.title}
            className="h-full w-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          {draw.status === 'completed' && draw.winner && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white font-bold text-sm">Winner</h3>
                <p className="text-gold text-base font-semibold">{draw.winner}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{draw.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gold-light font-medium text-xs mb-3">{draw.description}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-white">{draw.currentParticipants} of {draw.maxParticipants} entries</span>
            <span className="text-white font-semibold">{timeLeft()}</span>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2" 
            label={`${draw.title} entries progress: ${draw.currentParticipants} of ${draw.maxParticipants}`}
          />
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center">
              <Coins className="h-4 w-4 text-gold mr-1" />
              <span className="text-xs text-white font-medium">
                {draw.ticketPrices.length > 1
                  ? `$${Math.min(...draw.ticketPrices)} - $${Math.max(...draw.ticketPrices)}`
                  : `$${draw.ticketPrices[0]}`}
              </span>
            </div>
            
            <Button
              onClick={handleClick}
              className={`px-4 text-xs ${
                draw.status === 'completed'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gold hover:bg-gold-dark text-black'
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
