
import React from 'react';
import { Banner } from '@/types';
import { BannerDatabaseRecord } from './types';

export const mapDatabaseToBanner = (dbBanner: BannerDatabaseRecord): Banner => ({
  id: dbBanner.id,
  imageUrl: dbBanner.image_url,
  linkUrl: dbBanner.link_url || '/draws',
  title: dbBanner.title || '',
  active: dbBanner.active,
  position: dbBanner.position
});

export const mapDatabaseToBanners = (dbBanners: BannerDatabaseRecord[]): Banner[] => {
  return dbBanners.map(mapDatabaseToBanner);
};

export const updateBannersState = (
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>,
  newBanner: Banner
): void => {
  setBanners(prev => [...prev, newBanner]);
};

export const updateBannerInState = (
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>,
  id: string,
  updates: Partial<Banner>
): void => {
  setBanners(prev => prev.map(b => 
    b.id === id ? { ...b, ...updates } : b
  ));
};

export const removeBannerFromState = (
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>,
  id: string
): void => {
  setBanners(prev => prev.filter(b => b.id !== id));
};

export const revertBannersState = (
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>,
  previousBanners: Banner[]
): void => {
  setBanners(previousBanners);
};
