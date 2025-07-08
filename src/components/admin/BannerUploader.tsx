
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeGoldBanner } from '../../utils/bannerUtils';
import { useToast } from '@/hooks/use-toast';
import { Upload, Check, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BannerUploader: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleUpdateBanner = async () => {
    setIsUploading(true);
    setIsComplete(false);

    try {
      await initializeGoldBanner();
      setIsComplete(true);
      toast({
        title: t('admin.banners.premiumBannerUpdated'),
        description: t('admin.banners.premiumBannerUpdatedDescription'),
        duration: 4000,
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        variant: 'destructive',
        title: t('admin.banners.updateFailed'),
        description: t('admin.banners.updateFailedDescription'),
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-gold/30 bg-black/8">
      <CardHeader>
        <CardTitle className="text-gold">{t('admin.banners.updatePremiumBanner')}</CardTitle>
        <CardDescription className="text-gold-light">
          {t('admin.banners.updatePremiumBannerDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video overflow-hidden rounded-md bg-black-light border border-gold/20">
          <img
            src="/lovable-uploads/3ba1bfaf-88ef-41ce-8abf-beb7e1144481.png"
            alt="Premium Gold DRAWIN Bar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-2 right-2 bg-gold/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-gold font-semibold">
            {t('admin.banners.premium')}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpdateBanner}
          disabled={isUploading || isComplete}
          className="w-full bg-[#F39C0A] hover:bg-[#F39C0A]/80 text-white font-bold mt-5"
        >
          {isUploading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin text-black" />
              {t('admin.banners.uploading')}
            </>
          ) : isComplete ? (
            <>
              <Check className="mr-2 h-4 w-4 text-white" />
              {t('admin.banners.bannerUpdated')}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4 text-white" />
              {t('admin.banners.updatePremiumBanner')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BannerUploader;
