
import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Banner } from '@/types';
import { BannerFormContent } from '../BannerFormContent';
import { useTranslation } from 'react-i18next';

interface BannerDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBanner: Banner | null;
  bannerImageUrl: string;
  isUploading: boolean;
  setBannerImageUrl: React.Dispatch<React.SetStateAction<string>>;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => void;
}

const BannerDrawer: React.FC<BannerDrawerProps> = ({
  isOpen,
  onOpenChange,
  selectedBanner,
  bannerImageUrl,
  isUploading,
  setBannerImageUrl,
  setIsUploading,
  onSuccess
}) => {
  const { t } = useTranslation();
  
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.banners.createBanner')}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-lg text-white">{selectedBanner ? t('admin.banners.editBanner') : t('admin.banners.createBanner')}</DrawerTitle>
          <DrawerDescription className="text-sm text-white/80">
            {selectedBanner ? t('admin.banners.editBannerDescription') : t('admin.banners.createBannerDescription')}
          </DrawerDescription>
        </DrawerHeader>
        <BannerFormContent
          selectedBanner={selectedBanner}
          bannerImageUrl={bannerImageUrl}
          isUploading={isUploading}
          setBannerImageUrl={setBannerImageUrl}
          setIsUploading={setIsUploading}
          onSuccess={onSuccess}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default BannerDrawer;
