
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Banner as AppBanner } from '@/types';

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

  // Default Unsplash banner images
  const defaultBanners = [
    {
      id: 'default-1',
      url: 'https://images.unsplash.com/photo-1627843240167-b1f9d00c5880',
      linkUrl: '/draws',
      active: true
    },
    {
      id: 'default-2',
      url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead',
      linkUrl: '/draws',
      active: true
    },
    {
      id: 'default-3',
      url: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c',
      linkUrl: '/draws',
      active: true
    },
    {
      id: 'default-4',
      url: 'https://images.unsplash.com/photo-1616514169928-a1e40c6f791c',
      linkUrl: '/draws',
      active: true
    }
  ];

  useEffect(() => {
    console.log('BannerSlider received banners:', propBanners?.length || 0);
    // Filter out any banners with broken image URLs that we've previously detected
    const filterBrokenBanners = (banners: AppBanner[]) => {
      return banners.filter(banner => !loadErrors[banner.id]);
    };

    // If we have banners from props, convert and use them
    if (propBanners && propBanners.length > 0) {
      const filteredBanners = filterBrokenBanners(propBanners);

      if (filteredBanners.length === 0) {
        console.log('All provided banners have loading errors, using defaults');
        setBanners(defaultBanners);
      } else {
        const convertedBanners = filteredBanners.map(banner => ({
          id: banner.id,
          url: banner.imageUrl || defaultBanners[0].url, // Use the first default banner as fallback
          linkUrl: banner.linkUrl || '/draws',
          active: banner.active !== false // Default to active if not specified
        }));
        console.log('Converted banners:', convertedBanners.length);
        setBanners(convertedBanners);
      }
    } else {
      // Otherwise use default banners
      console.log('Using default banners');
      setBanners(defaultBanners);
    }
  }, [propBanners, loadErrors]);

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

    // Use a different Unsplash image as fallback
    e.currentTarget.src = 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead';

    // Show toast only for non-default banners (user uploaded ones)
    if (!banner.id.startsWith('default-')) {
      toast({
        variant: 'destructive',
        title: 'Image failed to load',
        description: 'Using fallback image instead. Please check or update this banner.'
      });
    }
  };

  if (activeBanners.length === 0) {
    console.log('No active banners to display');
    return null;
  }

  console.log('Rendering banner slider with', activeBanners.length, 'active banners');

  return (
    <div className="w-full overflow-hidden mb-6 relative">
      <Card className="shadow-[0_0_20px_rgba(212,175,55,0.15)] rounded-xl overflow-hidden border-gold/20">
        <div className="relative h-[292px] md:h-[356px]">
          {activeBanners.map((banner, index) => (
            <a
              key={banner.id}
              href={banner.linkUrl || '/draws'}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
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
                    <span className="text-sm">Using fallback image</span>
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
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
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
