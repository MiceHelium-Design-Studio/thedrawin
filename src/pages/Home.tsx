
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
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Enhanced premium background effects */}
      <div className="fixed inset-0 pattern-bg pointer-events-none" />
      <div className="fixed inset-0 hero-glow pointer-events-none" />
      
      {/* Enhanced floating orbs */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-[#F39C0A]/20 rounded-full blur-3xl animate-pulse opacity-40" />
      <div className="fixed bottom-32 right-20 w-40 h-40 bg-[#06B6D4]/15 rounded-full blur-3xl animate-pulse opacity-30" style={{ animationDelay: '2s' }} />
      <div className="fixed top-1/2 left-1/3 w-24 h-24 bg-[#F39C0A]/10 rounded-full blur-2xl animate-pulse opacity-50" style={{ animationDelay: '4s' }} />
      
      {/* Premium data streams with enhanced animation */}
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F39C0A]/30 to-transparent opacity-70">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2.5s_linear_infinite]" />
      </div>
      <div className="fixed bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#06B6D4]/25 to-transparent opacity-60">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_3.5s_linear_infinite]" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Enhanced side accent lines */}
      <div className="fixed left-0 top-1/4 w-px h-32 bg-gradient-to-b from-transparent via-[#F39C0A]/40 to-transparent opacity-80" />
      <div className="fixed right-0 top-3/4 w-px h-24 bg-gradient-to-b from-transparent via-[#06B6D4]/35 to-transparent opacity-70" />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <HeroSection user={user} authLoading={authLoading} />
          
          {isLoading ? (
            <LoadingSection />
          ) : (
            <div className="space-y-24">
              {/* Enhanced banner section with premium frame */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/5 via-transparent to-[#06B6D4]/5 rounded-3xl blur-xl" />
                <div className="relative">
                  <BannerSlider banners={displayBanners} />
                </div>
              </div>
              
              <HowItWorksSection />
              
              {/* Enhanced active draws with premium container */}
              {activeDraws.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/8 via-transparent to-[#06B6D4]/6 rounded-3xl" />
                  <div className="relative p-8 rounded-3xl border border-[#F39C0A]/10">
                    <ActiveDrawsSection 
                      activeDraws={activeDraws} 
                      onViewAll={handleViewAll} 
                    />
                  </div>
                </div>
              )}
              
              <RecentWinnersSection />
              
              {/* Enhanced all draws section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tl from-[#06B6D4]/6 via-transparent to-[#F39C0A]/4 rounded-3xl" />
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
