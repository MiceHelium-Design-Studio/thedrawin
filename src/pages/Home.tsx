
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraws } from '../context/DrawContext';
import { useAuth } from '../context/AuthContext';
import BannerSlider from '../components/draws/BannerSlider';
import HowItWorksSection from '../components/home/HowItWorksSection';
import RecentWinnersSection from '../components/home/RecentWinnersSection';
import HeroSection from '../components/home/HeroSection';
import ErrorSection from '../components/home/ErrorSection';
import LoadingSection from '../components/home/LoadingSection';
import ActiveDrawsSection from '../components/home/ActiveDrawsSection';
import AllDrawsSection from '../components/home/AllDrawsSection';

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
    return <ErrorSection user={user} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0D0D0D' }}>
      {/* Premium gradient header */}
      <div className="fixed top-0 left-0 w-full h-32 premium-gradient-header pointer-events-none opacity-60" />
      
      {/* Ambient background effects */}
      <div className="fixed top-20 left-10 w-32 h-32 rounded-full blur-3xl animate-pulse opacity-40" style={{ background: 'rgba(243, 156, 10, 0.1)' }} />
      <div className="fixed bottom-32 right-20 w-40 h-40 rounded-full blur-3xl animate-pulse opacity-30" style={{ background: 'rgba(6, 182, 212, 0.08)', animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/3 w-24 h-24 rounded-full blur-2xl animate-pulse opacity-50" style={{ background: 'rgba(243, 156, 10, 0.06)', animationDelay: '4s' }} />
      
      {/* Premium data streams */}
      <div className="fixed top-0 left-0 w-full h-px opacity-70" style={{ background: 'linear-gradient(to right, transparent, rgba(243, 156, 10, 0.3), transparent)' }}>
        <div className="w-full h-full animate-[shimmer_2.5s_linear_infinite]" style={{ background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent)' }} />
      </div>
      <div className="fixed bottom-0 left-0 w-full h-px opacity-60" style={{ background: 'linear-gradient(to right, transparent, rgba(6, 182, 212, 0.25), transparent)' }}>
        <div className="w-full h-full animate-[shimmer_3.5s_linear_infinite]" style={{ background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent)', animationDelay: '1s' }} />
      </div>
      
      {/* Side accent lines */}
      <div className="fixed left-0 top-1/4 w-px h-32 opacity-80" style={{ background: 'linear-gradient(to bottom, transparent, rgba(243, 156, 10, 0.4), transparent)' }} />
      <div className="fixed right-0 top-3/4 w-px h-24 opacity-70" style={{ background: 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.35), transparent)' }} />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <HeroSection user={user} authLoading={authLoading} />
          
          {isLoading ? (
            <LoadingSection />
          ) : (
            <div className="space-y-24">
              {/* Premium banner section */}
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-xl" style={{ background: 'linear-gradient(to right, rgba(243, 156, 10, 0.08), transparent, rgba(6, 182, 212, 0.06))' }} />
                <div className="relative">
                  <BannerSlider banners={displayBanners} />
                </div>
              </div>
              
              <HowItWorksSection />
              
              {/* Active draws with premium container */}
              {activeDraws.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(to bottom right, rgba(243, 156, 10, 0.12), transparent, rgba(6, 182, 212, 0.08))' }} />
                  <div className="relative luxury-card">
                    <ActiveDrawsSection 
                      activeDraws={activeDraws} 
                      onViewAll={handleViewAll} 
                    />
                  </div>
                </div>
              )}
              
              <RecentWinnersSection />
              
              {/* All draws section */}
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(to top left, rgba(6, 182, 212, 0.08), transparent, rgba(243, 156, 10, 0.06))' }} />
                <div className="relative">
                  <AllDrawsSection 
                    draws={sortedDraws} 
                    onViewAll={handleViewAll} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
