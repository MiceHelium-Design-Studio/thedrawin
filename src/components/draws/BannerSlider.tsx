
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Banner } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSliderProps {
  banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Replace the first banner with our new image
  const modifiedBanners = [...banners];
  if (modifiedBanners.length > 0) {
    modifiedBanners[0] = {
      ...modifiedBanners[0],
      imageUrl: '/lovable-uploads/2c2655f0-2a53-4df4-ac6a-e95fa7632038.png'
    };
  }
  
  // Filter active banners
  const activeBanners = modifiedBanners.filter(banner => banner.active);
  
  if (activeBanners.length === 0) {
    return null;
  }

  // Auto-rotation logic
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === activeBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
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

  return (
    <div className="w-full overflow-hidden mb-6 relative">
      <Card className="shadow-md rounded-xl overflow-hidden">
        <div className="relative h-48 md:h-64">
          {activeBanners.map((banner, index) => (
            <a 
              key={banner.id} 
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={banner.imageUrl}
                alt="Advertisement"
                className="w-full h-full object-cover"
              />
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
