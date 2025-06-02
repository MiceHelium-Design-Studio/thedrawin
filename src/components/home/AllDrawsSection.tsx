
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DrawCard from '../draws/DrawCard';
import { Draw } from '@/types';

interface AllDrawsSectionProps {
  draws: Draw[];
  onViewAll: () => void;
}

const AllDrawsSection: React.FC<AllDrawsSectionProps> = ({ draws, onViewAll }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold uppercase tracking-wide">
          <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            All Draws
          </span>
        </h2>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          Browse All
        </Button>
      </div>
      
      <div className="grid gap-4 md:gap-6">
        {draws && draws.length > 0 ? (
          draws.slice(0, 4).map(draw => (
            <DrawCard key={draw.id} draw={draw} />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-900/50 rounded-xl">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-gold-500">No Draws Available</h3>
            <p className="text-white/60 mb-6">
              New exciting draws are coming soon. Stay tuned!
            </p>
            <Button variant="outline" onClick={() => navigate('/notifications')}>
              Get Notified
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllDrawsSection;
