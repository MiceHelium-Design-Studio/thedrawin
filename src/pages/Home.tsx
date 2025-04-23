import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDraws } from '../context/DrawContext';
import { useAuth } from '../context/AuthContext';
import DrawCard from '../components/draws/DrawCard';
import BannerSlider from '../components/draws/BannerSlider';
import { Skeleton } from '@/components/ui/skeleton';

const Home: React.FC = () => {
  const {
    draws = [],
    banners = [],
    loading: drawsLoading
  } = useDraws();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const isLoading = authLoading || drawsLoading;

  useEffect(() => {
    console.log("Home component rendering, loading state:", isLoading);
    console.log("User in Home:", user?.id);
    console.log("Draws loaded:", draws?.length || 0, "items");
  }, [isLoading, user, draws]);

  const sortedDraws = [...(draws || [])].sort((a, b) => {
    const statusOrder = {
      active: 0,
      upcoming: 1,
      completed: 2
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const activeDraws = (draws || []).filter(draw => draw.status === 'active');

  const handleViewAll = () => {
    navigate('/draws');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <img 
          src="/lovable-uploads/6399df78-972b-4279-9285-e76cb4bcc6b4.png"
          alt="DRAWIN Gold Bars"
          className="w-full max-w-md mx-auto rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
      ) : (
        <>
          {banners && banners.length > 0 && <BannerSlider banners={banners} />}
          
          {activeDraws && activeDraws.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold uppercase">Active Draws</h2>
                <Button variant="ghost" size="sm" onClick={handleViewAll}>
                  View All
                </Button>
              </div>
              
              <div className="grid gap-4">
                {activeDraws.map(draw => <DrawCard key={draw.id} draw={draw} />)}
              </div>
            </section>
          )}
          
          <section>
            <h2 className="text-base font-semibold mb-4 uppercase">All Draws</h2>
            <div className="grid gap-4">
              {sortedDraws && sortedDraws.length > 0 ? sortedDraws.map(draw => <DrawCard key={draw.id} draw={draw} />) : <div className="text-center py-8 text-gold-light font-medium">
                  No draws available
                </div>}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
