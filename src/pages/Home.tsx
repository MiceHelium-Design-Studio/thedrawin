
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
    loading: drawsLoading,
    error
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
    console.log("Error state:", error);
  }, [isLoading, user, draws, banners, error]);

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
  
  // Use banners from backend if available, otherwise use defaults
  const displayBanners = banners && banners.length > 0 
    ? banners 
    : defaultBannerUrls.map((url, index) => ({
        id: `default-${index}`,
        imageUrl: url,
        linkUrl: '/draws',
        active: true
      }));

  // Show error state if there's an error and no draws are loaded
  if (error && (!draws || draws.length === 0)) {
    return (
      <div className="min-h-screen bg-black">
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

          <div className="text-center py-12 bg-gray-900/50 rounded-xl">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2 text-gold-500">Error Loading Draws</h3>
            <p className="text-white/60 mb-6">
              We're having trouble loading the draws. Please try refreshing the page.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mr-4"
            >
              Refresh Page
            </Button>
            {!user && (
              <Button onClick={() => navigate('/login')} className="bg-gold-500 hover:bg-gold-600 text-black">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
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
          
          {/* Authentication prompt for non-logged in users */}
          {!user && !authLoading && (
            <div className="mt-6 p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg max-w-md">
              <p className="text-gold-500 mb-3">Ready to enter draws and win prizes?</p>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold"
              >
                Sign Up / Login to Get Started
              </Button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-lg bg-gray-800" />
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-32 w-full rounded-md bg-gray-800" />
              <Skeleton className="h-32 w-full rounded-md bg-gray-800" />
              <Skeleton className="h-32 w-full rounded-md bg-gray-800" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-md bg-gray-800" />
              <Skeleton className="h-24 w-full rounded-md bg-gray-800" />
              <Skeleton className="h-24 w-full rounded-md bg-gray-800" />
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
                    <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
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
                  <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
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
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
