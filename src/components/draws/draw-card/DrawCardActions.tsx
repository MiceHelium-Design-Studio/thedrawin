
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DrawCardActionsProps {
  canEnterDraw: boolean;
  canPickWinner: boolean;
  drawId: string;
  onEnterDraw: () => void;
  onPickWinner: () => void;
}

const DrawCardActions: React.FC<DrawCardActionsProps> = ({
  canEnterDraw,
  canPickWinner,
  drawId,
  onEnterDraw,
  onPickWinner
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      {canEnterDraw ? (
        <Button 
          variant="default" 
          className="flex-1" 
          onClick={onEnterDraw}
        >
          Enter Draw
        </Button>
      ) : (
        <Button 
          variant="default" 
          className="flex-1" 
          onClick={() => navigate(`/draw/${drawId}`)}
        >
          View Details
        </Button>
      )}
      
      {canPickWinner && (
        <Button 
          variant="outline" 
          onClick={onPickWinner}
        >
          Pick Winner
        </Button>
      )}
    </div>
  );
};

export default DrawCardActions;
