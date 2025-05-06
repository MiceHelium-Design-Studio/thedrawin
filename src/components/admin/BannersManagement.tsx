
import React, { useState, useEffect } from 'react';
import { useDraws } from '@/context/DrawContext';
import { Banner } from '../../types';
import BannerTable from './banners/BannerTable';
import BannerDrawer from './banners/BannerDrawer';

const BannersManagement: React.FC = () => {
  const { banners, fetchBanners } = useDraws();
  const [isBannerDrawerOpen, setIsBannerDrawerOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEditBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setBannerImageUrl(banner.imageUrl);
    setIsBannerDrawerOpen(true);
  };

  const resetBannerForm = () => {
    setSelectedBanner(null);
    setBannerImageUrl('');
    setIsBannerDrawerOpen(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Banners</h2>
        <BannerDrawer
          isOpen={isBannerDrawerOpen}
          onOpenChange={setIsBannerDrawerOpen}
          selectedBanner={selectedBanner}
          bannerImageUrl={bannerImageUrl}
          isUploading={isUploading}
          setBannerImageUrl={setBannerImageUrl}
          setIsUploading={setIsUploading}
          onSuccess={resetBannerForm}
        />
      </div>

      <BannerTable banners={banners} onEdit={handleEditBanner} />
    </section>
  );
};

export default BannersManagement;
