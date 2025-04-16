
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Banner as AppBanner } from '@/types'; // Import the Banner type from our types file
import { initializeGoldBanner } from '@/utils/bannerUtils';

interface Banner {
  id: string;
  url: string;
  linkUrl?: string;
  active?: boolean;
}

const BannerSlider: React.FC<{ banners?: AppBanner[] }> = ({ banners: propBanners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  
  // Unified useEffect for fetching banners - ensuring it always runs in the same order
  useEffect(() => {
    const fetchAndSetBanners = async () => {
      if (propBanners && propBanners.length > 0) {
        // Map the AppBanner type to the internal Banner type
        const convertedBanners = propBanners.map(banner => ({
          id: banner.id,
          url: banner.url || banner.imageUrl, // Use url if available, otherwise imageUrl
          linkUrl: banner.linkUrl,
          active: banner.active
        }));
        setBanners(convertedBanners);
        return;
      }
      
      // Only fetch banners if none were provided as props
      try {
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('type', 'banner');
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Convert media_items to Banner format
          const formattedBanners = data.map(item => ({
            id: item.id,
            url: item.url,
            linkUrl: '/draws', // Default link
            active: true // Default active status
          }));
          
          setBanners(formattedBanners);
        } else {
          // If no banners exist, initialize the default banner
          await initializeGoldBanner();
          
          // Fetch again after initializing
          const { data: updatedData } = await supabase
            .from('media_items')
            .select('*')
            .eq('type', 'banner');
            
          if (updatedData && updatedData.length > 0) {
            const formattedBanners = updatedData.map(item => ({
              id: item.id,
              url: item.url,
              linkUrl: '/draws',
              active: true
            }));
            
            setBanners(formattedBanners);
          }
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load banners',
          description: 'There was a problem loading the banner images.'
        });
      }
    };
    
    fetchAndSetBanners();
  }, [propBanners]);
  
  // Filter active banners after banners have been fetched
  const activeBanners = banners.filter(banner => banner.active !== false);
  
  // Auto-rotation logic - maintaining consistent hook order is critical
  useEffect(() => {
    // Always define the interval cleanup function, even if it does nothing
    let interval: number | undefined;
    
    if (activeBanners.length > 1) {
      interval = window.setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }
    
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [activeBanners.length]); // Only dependency is the length of active banners

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
    );
  };

  const handleImageError = (banner: Banner, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load banner image:', {
      bannerId: banner.id,
      imageUrl: banner.url
    });
    
    // Set this banner as having a load error
    setLoadErrors(prev => ({ ...prev, [banner.id]: true }));
    
    // Show a toast notification
    toast({
      variant: 'destructive',
      title: 'Image failed to load',
      description: `Banner image couldn't be displayed. Please check the URL: ${banner.url}`
    });
    
    // Apply fallback styling
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.className = e.currentTarget.className + ' opacity-50';
  };

  // Early return if no active banners after filtering
  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden mb-6 relative">
      <Card className="shadow-md rounded-xl overflow-hidden">
        <div className="relative h-48 md:h-64">
          {activeBanners.map((banner, index) => (
            <a 
              key={banner.id} 
              href={banner.linkUrl || '/draws'}
              target="_blank"
              rel="noopener noreferrer"
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={banner.url}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(banner, e)}
                loading="lazy"
              />
              
              {loadErrors[banner.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-red-500/80 text-white px-3 py-2 rounded-md flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Image failed to load</span>
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
        
        {activeBanners.length > 1 && (
          <>
            <button 
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-black/70 transition-colors"
              aria-label="Previous banner"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-20 hover:bg-black/70 transition-colors"
              aria-label="Next banner"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-gold' : 'bg-white/50'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default BannerSlider;
