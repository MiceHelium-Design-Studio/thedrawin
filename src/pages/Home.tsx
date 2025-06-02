
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
    <div className="min-h-screen bg-[#08080C] relative overflow-hidden">
      {/* Premium background effects */}
      <div className="fixed inset-0 pattern-bg pointer-events-none" />
      <div className="fixed inset-0 hero-glow pointer-events-none" />
      
      {/* Subtle data streams */}
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F39C0A]/20 to-transparent opacity-60">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_3s_linear_infinite]" />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <HeroSection user={user} authLoading={authLoading} />
          
          {isLoading ? (
            <LoadingSection />
          ) : (
            <div className="space-y-20">
              <BannerSlider banners={displayBanners} />
              <HowItWorksSection />
              <ActiveDrawsSection 
                activeDraws={activeDraws} 
                onViewAll={handleViewAll} 
              />
              <RecentWinnersSection />
              <AllDrawsSection 
                draws={sortedDraws} 
                onViewAll={handleViewAll} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
