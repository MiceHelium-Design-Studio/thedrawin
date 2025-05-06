
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
    console.log("Banners loaded:", banners?.length || 0, "items");
  }, [isLoading, user, draws, banners]);

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

  // Default Unsplash banner URLs to use if no banners from backend
  const defaultBannerUrls = [
    "https://images.unsplash.com/photo-1627843240167-b1f9d00c5880",
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead",
    "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c",
    "https://images.unsplash.com/photo-1616514169928-a1e40c6f791c"
  ];
  
  // Use default banners if none available from backend
  const displayBanners = banners && banners.length > 0 
    ? banners 
    : defaultBannerUrls.map((url, index) => ({
        id: `default-${index}`,
        imageUrl: url,
        linkUrl: '/draws',
        active: true
      }));

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
          alt="DRAWIN - The First Draw & Win App" 
          className="max-w-[280px] md:max-w-[320px] mx-auto mb-2"
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
          {/* Banner slider positioned between logo and Active Draws */}
          <BannerSlider banners={displayBanners} />
          
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
          
          <section className="mb-8">
            <h2 className="text-base font-semibold mb-4 uppercase">All Draws</h2>
            <div className="grid gap-4">
              {sortedDraws && sortedDraws.length > 0 ? (
                sortedDraws.map(draw => <DrawCard key={draw.id} draw={draw} />)
              ) : (
                <div className="text-center py-8 text-gold-light font-medium">
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
