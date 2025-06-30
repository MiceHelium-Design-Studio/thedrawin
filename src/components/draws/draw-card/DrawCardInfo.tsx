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
        <div className="flex items-center text-green-500 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
          <Award className="h-4 w-4 mr-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium">Winner: {draw.winner}</span>
              {draw.winnerTicketNumber && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-2">
                  #{draw.winnerTicketNumber}
                </span>
              )}
            </div>
            {draw.status === 'completed' && (
              <p className="text-xs text-green-400 mt-1">🎉 Congratulations!</p>
            )}
          </div>
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
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entry Fee Options:</p>
          <div className="flex flex-wrap gap-1">
            {draw.ticketPrices.map((price, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
              >
                ${price}
              </span>
            ))}
          </div>
          {draw.ticketPrices.length > 1 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose your preferred entry fee when joining
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DrawCardInfo;
