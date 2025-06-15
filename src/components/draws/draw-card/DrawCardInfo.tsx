
import React from 'react';
import { Calendar, Users, Award, Lock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Draw } from '@/types';

interface DrawCardInfoProps {
  draw: Draw;
}

const DrawCardInfo: React.FC<DrawCardInfoProps> = ({ draw }) => {
  return (
    <div className="space-y-3 mb-4 text-sm">
      <div className="flex items-center text-gray-500">
        <Calendar className="h-4 w-4 mr-2" />
        <span>
          {draw.startDate && format(new Date(draw.startDate), 'MMMM d, yyyy')}
        </span>
      </div>
      
      <div className="flex items-center text-gray-500">
        <Users className="h-4 w-4 mr-2" />
        <span>
          {draw.currentParticipants} / {draw.maxParticipants} participants
        </span>
      </div>
      
      {draw.winner && (
        <div className="flex items-center text-green-500">
          <Award className="h-4 w-4 mr-2" />
          <span className="font-medium">Winner: {draw.winner}</span>
        </div>
      )}
      
      {draw.status === 'upcoming' && (
        <div className="flex items-center text-yellow-500">
          <Lock className="h-4 w-4 mr-2" />
          <span>Opens {draw.startDate && format(new Date(draw.startDate), 'MMM d')}</span>
        </div>
      )}
      
      {(draw.status === 'active' || draw.status === 'open') && (
        <div className="flex items-center text-green-500">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>Entries: {draw.numberOfTickets || 0}</span>
        </div>
      )}

      {/* Show ticket prices */}
      {draw.ticketPrices && draw.ticketPrices.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Entry fees:</span>
          <div className="flex gap-1">
            {draw.ticketPrices.map((price, index) => (
              <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                ${price}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawCardInfo;
