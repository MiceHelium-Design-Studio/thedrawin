
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Banner as AppBanner } from '@/types';
import { initializeGoldBanner } from '@/utils/bannerUtils';
import { initializeDemoImages, initializeDemoBanners } from '@/utils/demoImageUtils';

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
  
  const defaultBanners = [
    {
      id: 'default-1',
      url: '/lovable-uploads/d2810e9f-1964-48c4-97be-48553adb004f.png',
      linkUrl: '/draws',
      active: true
    },
    {
      id: 'default-2',
      url: '/lovable-uploads/3ba1bfaf-88ef-41ce-8abf-beb7e1144481.png',
      linkUrl: '/draws',
      active: true
    },
    {
      id: 'default-3',
      url: '/lovable-uploads/a3f55f49-2874-4022-824b-6b3cd22c8837.png',
      linkUrl: '/draws',
      active: true
    }
  ];

  useEffect(() => {
    const fetchAndSetBanners = async () => {
      if (propBanners && propBanners.length > 0) {
        const convertedBanners = propBanners.map(banner => ({
          id: banner.id,
          url: banner.imageUrl, // Use imageUrl as url
          linkUrl: banner.linkUrl,
          active: banner.active
        }));
        setBanners(convertedBanners);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('type', 'banner');
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedBanners = data.map(item => ({
            id: item.id,
            url: item.url,
            linkUrl: '/draws',
            active: true
          }));
          
          setBanners(formattedBanners);
        } else {
          // Initialize demo images and banners
          await initializeDemoImages();
          await initializeDemoBanners();
          
          // Retry fetching banners after initialization
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
          } else {
            // Fallback to default banners if we still don't have any
            setBanners(defaultBanners);
          }
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load banners',
          description: 'Using default banners as fallback.'
        });
        
        // Use default banners as fallback
        setBanners(defaultBanners);
      }
    };
    
    fetchAndSetBanners();
  }, [propBanners]);
  
  const activeBanners = banners.filter(banner => banner.active !== false);
  
  useEffect(() => {
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
  }, [activeBanners.length]);
  
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
    
    setLoadErrors(prev => ({ ...prev, [banner.id]: true }));
    
    toast({
      variant: 'destructive',
      title: 'Image failed to load',
      description: `Banner image couldn't be displayed. Please check the URL: ${banner.url}`
    });
    
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.className = e.currentTarget.className + ' opacity-50 bg-gradient-to-r from-gold/10 to-black';
  };

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden mb-6 relative">
      <Card className="shadow-[0_0_20px_rgba(212,175,55,0.15)] rounded-xl overflow-hidden border-gold/20">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40"></div>
              
              {loadErrors[banner.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="bg-black/80 text-gold px-3 py-2 rounded-md flex items-center border border-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-gold p-2 rounded-full z-20 hover:bg-black/80 hover:text-gold-light transition-colors border border-gold/30"
              aria-label="Previous banner"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-gold p-2 rounded-full z-20 hover:bg-black/80 hover:text-gold-light transition-colors border border-gold/30"
              aria-label="Next banner"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-gold w-4 shadow-[0_0_5px_rgba(212,175,55,0.5)]' 
                      : 'bg-white/50'
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
