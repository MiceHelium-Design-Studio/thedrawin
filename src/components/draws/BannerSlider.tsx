
import React from 'react';
import { Card } from '@/components/ui/card';
import { Banner } from '../../types';

interface BannerSliderProps {
  banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const activeBanners = banners.filter(banner => banner.active);
  
  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden mb-6">
      <Card className="border-0 shadow-md">
        {activeBanners.map((banner) => (
          <a 
            key={banner.id} 
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-40"
          >
            <img
              src={banner.imageUrl}
              alt="Advertisement"
              className="w-full h-full object-cover"
            />
          </a>
        ))}
      </Card>
    </div>
  );
};

export default BannerSlider;
