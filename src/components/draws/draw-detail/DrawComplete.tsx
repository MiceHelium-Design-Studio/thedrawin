
import React from 'react';
import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface DrawCompleteProps {
  status: 'completed' | 'upcoming' | 'active';
  winner?: string;
}

export const DrawComplete = ({ status, winner }: DrawCompleteProps) => {
  return (
    <Card className="text-center py-6 px-4 mt-6 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
      {status === 'completed' ? (
        <>
          <p className="text-lg font-medium mb-4">
            This draw has ended
          </p>
          {winner ? (
            <div className="mt-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4">
                <Trophy className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-sm text-gray-500 mb-1">Winner</h3>
              <p className="text-gold text-xl font-bold">{winner}</p>
            </div>
          ) : (
            <p className="text-gray-500">Winner announcement pending</p>
          )}
        </>
      ) : status === 'upcoming' ? (
        <div className="py-4">
          <p className="text-lg font-medium mb-2">This draw has not started yet</p>
          <p className="text-gray-500">Check back soon to enter this draw!</p>
        </div>
      ) : (
        <p className="text-lg font-medium">This draw is currently active</p>
      )}
    </Card>
  );
};
