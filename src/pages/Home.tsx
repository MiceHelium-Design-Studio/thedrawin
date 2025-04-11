
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDraws } from '../context/DrawContext';
import DrawCard from '../components/draws/DrawCard';
import BannerSlider from '../components/draws/BannerSlider';

const Home: React.FC = () => {
  const { draws, banners } = useDraws();
  const navigate = useNavigate();
  
  // Get active draws first, then upcoming, then completed
  const sortedDraws = [...draws].sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  // Filter active draws for the featured section
  const activeDraws = draws.filter(draw => draw.status === 'active');
  
  const handleViewAll = () => {
    navigate('/draws');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6 flex items-center uppercase">
        <span className="bg-gold-gradient bg-clip-text text-transparent">THE DRAW WIN 2025</span>
      </h1>
      
      <BannerSlider banners={banners} />
      
      {activeDraws.length > 0 && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold uppercase">Active Draws</h2>
            <Button variant="ghost" size="sm" onClick={handleViewAll}>
              View All
            </Button>
          </div>
          
          <div className="grid gap-4">
            {activeDraws.map(draw => (
              <DrawCard key={draw.id} draw={draw} />
            ))}
          </div>
        </section>
      )}
      
      <section>
        <h2 className="text-base font-semibold mb-4 uppercase">All Draws</h2>
        <div className="grid gap-4">
          {sortedDraws.map(draw => (
            <DrawCard key={draw.id} draw={draw} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
