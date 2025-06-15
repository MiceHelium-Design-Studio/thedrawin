
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Draw } from '@/types';
import DrawCardInfo from './DrawCardInfo';
import DrawCardActions from './DrawCardActions';

interface DrawCardContentProps {
  draw: Draw;
  canEnterDraw: boolean;
  canPickWinner: boolean;
  onEnterDraw: () => void;
  onPickWinner: () => void;
}

const DrawCardContent: React.FC<DrawCardContentProps> = ({
  draw,
  canEnterDraw,
  canPickWinner,
  onEnterDraw,
  onPickWinner
}) => {
  return (
    <CardContent className="p-5">
      <h3 className="font-bold text-xl mb-2">{draw.title}</h3>
      
      <DrawCardInfo draw={draw} />
      
      <DrawCardActions
        canEnterDraw={canEnterDraw}
        canPickWinner={canPickWinner}
        drawId={draw.id}
        onEnterDraw={onEnterDraw}
        onPickWinner={onPickWinner}
      />
    </CardContent>
  );
};

export default DrawCardContent;
