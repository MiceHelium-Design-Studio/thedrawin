
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
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Banner
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{selectedBanner ? 'Edit Banner' : 'Create Banner'}</DrawerTitle>
          <DrawerDescription>
            {selectedBanner ? 'Edit the banner details.' : 'Create a new banner to display on the site.'}
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
