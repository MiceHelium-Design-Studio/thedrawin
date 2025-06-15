
import React from 'react';
import { Card } from "@/components/ui/card";
import { useDraws } from '@/context/DrawContext';

const StatisticsContent: React.FC = () => {
  const { draws } = useDraws();
  
  // Calculate statistics from draws
  const totalDraws = draws.length;
  const activeDraws = draws.filter(draw => draw.status === 'active').length;
  const completedDraws = draws.filter(draw => draw.status === 'completed').length;
  const totalTicketsSold = draws.reduce((total, draw) => total + (draw.numberOfTickets || 0), 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: '#FFFFFF' }}>Statistics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium" style={{ color: '#FFFFFF' }}>Total Draws</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#FFFFFF' }}>{totalDraws}</p>
          </div>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium" style={{ color: '#FFFFFF' }}>Active Draws</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#FFFFFF' }}>{activeDraws}</p>
          </div>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium" style={{ color: '#FFFFFF' }}>Completed Draws</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#FFFFFF' }}>{completedDraws}</p>
          </div>
        </Card>

        <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium" style={{ color: '#FFFFFF' }}>Total Tickets Sold</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#FFFFFF' }}>{totalTicketsSold}</p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default StatisticsContent;
