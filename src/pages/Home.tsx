
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDraws } from '../context/DrawContext';
import { useAuth } from '../context/AuthContext';
import DrawCard from '../components/draws/DrawCard';
import BannerSlider from '../components/draws/BannerSlider';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const Home: React.FC = () => {
  const { draws = [], banners = [], loading: drawsLoading } = useDraws();
  const { user, loading: authLoading, clearCacheAndReload } = useAuth();
  const navigate = useNavigate();
  
  const isLoading = authLoading || drawsLoading;
  
  useEffect(() => {
    console.log("Home component rendering, loading state:", isLoading);
    console.log("User in Home:", user?.id);
    console.log("Draws loaded:", draws?.length || 0, "items");
  }, [isLoading, user, draws]);
  
  // Get active draws first, then upcoming, then completed
  const sortedDraws = [...(draws || [])].sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, completed: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  // Filter active draws for the featured section
  const activeDraws = (draws || []).filter(draw => draw.status === 'active');
  
  const handleViewAll = () => {
    navigate('/draws');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold flex items-center uppercase">
          <span className="bg-gold-gradient bg-clip-text text-transparent">THE DRAW WIN 2025</span>
        </h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearCacheAndReload}
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          <RotateCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          <span>{isLoading ? "Loading..." : "Refresh"}</span>
        </Button>
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
          {banners && banners.length > 0 && (
            <BannerSlider banners={banners} />
          )}
          
          {activeDraws && activeDraws.length > 0 && (
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
              {sortedDraws && sortedDraws.length > 0 ? (
                sortedDraws.map(draw => (
                  <DrawCard key={draw.id} draw={draw} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No draws available
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
