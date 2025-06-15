
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, Coins } from 'lucide-react';
import { useDraws } from '../context/DrawContext';
import { format } from 'date-fns';

const Winners: React.FC = () => {
  const { draws } = useDraws();
  
  // Filter completed draws with winners
  const completedDraws = draws.filter(
    draw => draw.status === 'completed' && draw.winner
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          <span className="bg-gold-gradient bg-clip-text text-transparent">Winners</span>
        </h1>
        <Award className="h-6 w-6 text-gold" />
      </div>
      
      {completedDraws.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No Winners Yet</h2>
          <p className="text-gray-500">
            The first draw results will be announced soon. Stay tuned!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedDraws.map(draw => (
            <Card key={draw.id} className="overflow-hidden">
              <div className="bg-gold text-black px-4 py-2 flex justify-between items-center">
                <h2 className="font-bold">{draw.title}</h2>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(draw.endDate), 'MMM d, yyyy')}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <p className="text-sm text-gray-500 mb-1">Winner</p>
                    <div className="flex items-center justify-center sm:justify-start">
                      <Award className="h-5 w-5 text-gold mr-2" />
                      <p className="text-xl font-bold">{draw.winner}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center px-6 py-3 bg-gray-100 rounded-full">
                    <Coins className="h-5 w-5 text-gold mr-2" />
                    <span className="font-medium">
                      ${Math.max(...draw.ticketPrices)} Prize
                    </span>
                  </div>
                </div>
                
                <p className="mt-4 text-gray-600">{draw.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Winners;
