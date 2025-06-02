
import React from 'react';
import { Button } from '@/components/ui/button';
import DrawCard from '../draws/DrawCard';
import { Draw } from '@/types';

interface ActiveDrawsSectionProps {
  activeDraws: Draw[];
  onViewAll: () => void;
}

const ActiveDrawsSection: React.FC<ActiveDrawsSectionProps> = ({ activeDraws, onViewAll }) => {
  if (!activeDraws || activeDraws.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold uppercase tracking-wide">
          <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Active Draws
          </span>
        </h2>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All Draws
        </Button>
      </div>
      
      <div className="grid gap-4 md:gap-6">
        {activeDraws.slice(0, 3).map(draw => (
          <DrawCard key={draw.id} draw={draw} />
        ))}
      </div>
    </section>
  );
};

export default ActiveDrawsSection;
