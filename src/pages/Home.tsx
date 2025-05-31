
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDraws } from '../context/DrawContext';
import { useAuth } from '../context/AuthContext';
import DrawCard from '../components/draws/DrawCard';
import BannerSlider from '../components/draws/BannerSlider';
import HowItWorksSection from '../components/home/HowItWorksSection';
import RecentWinnersSection from '../components/home/RecentWinnersSection';
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <img 
            src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
            alt="DRAWIN - The First Draw & Win App" 
            className="max-w-[280px] md:max-w-[320px] lg:max-w-[400px] mx-auto mb-4"
          />
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join exciting draws, win amazing prizes, and be part of the ultimate gaming experience
          </p>
        </div>
        
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>
        ) : (
          <>
            {/* Banner slider */}
            <BannerSlider banners={displayBanners} />
            
            {/* How It Works Section */}
            <HowItWorksSection />
            
            {/* Active Draws Section */}
            {activeDraws && activeDraws.length > 0 && (
              <section className="mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold uppercase tracking-wide">
                    <span className="bg-gold-gradient bg-clip-text text-transparent">
                      Active Draws
                    </span>
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleViewAll}>
                    View All Draws
                  </Button>
                </div>
                
                <div className="grid gap-4 md:gap-6">
                  {activeDraws.slice(0, 3).map(draw => (
                    <DrawCard key={draw.id} draw={draw} />
                  ))}
                </div>
              </section>
            )}
            
            {/* Recent Winners Section */}
            <RecentWinnersSection />
            
            {/* All Draws Section */}
            <section className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">
                  <span className="bg-gold-gradient bg-clip-text text-transparent">
                    All Draws
                  </span>
                </h2>
                <Button variant="outline" size="sm" onClick={handleViewAll}>
                  Browse All
                </Button>
              </div>
              
              <div className="grid gap-4 md:gap-6">
                {sortedDraws && sortedDraws.length > 0 ? (
                  sortedDraws.slice(0, 4).map(draw => (
                    <DrawCard key={draw.id} draw={draw} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-black-light/30 rounded-xl">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold mb-2 text-gold">No Draws Available</h3>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
