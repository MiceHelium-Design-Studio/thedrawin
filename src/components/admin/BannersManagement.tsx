
import React, { useState, useEffect } from 'react';
import { useDraws } from '@/context/DrawContext';
import { Banner } from '../../types';
import BannerTable from './banners/BannerTable';
import BannerDrawer from './banners/BannerDrawer';
import BannerSlider from '../draws/BannerSlider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BannerUploader from './BannerUploader';
import { SlidersHorizontal, LayoutGrid, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const BannersManagement: React.FC = () => {
  const { banners, fetchBanners } = useDraws();
  const [isBannerDrawerOpen, setIsBannerDrawerOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

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
    fetchBanners(); // Refresh banner data
  };
  
  const handleRefreshBanners = async () => {
    try {
      setIsRefreshing(true);
      await fetchBanners();
      toast({
        title: "Banners refreshed",
        description: "The banner list has been updated.",
      });
    } catch (error) {
      console.error('Error refreshing banners:', error);
      toast({
        variant: 'destructive',
        title: "Refresh failed",
        description: "There was a problem refreshing the banners.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Banners</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshBanners}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={() => {
              setSelectedBanner(null);
              setBannerImageUrl('');
              setIsBannerDrawerOpen(true);
            }}
          >
            Add Banner
          </Button>
        </div>
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

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4" />
            Banner List
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <BannerTable banners={banners} onEdit={handleEditBanner} />
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Premium Banner</h3>
            <BannerUploader />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card className="p-5 bg-black/50 border-gold/10 backdrop-blur-sm">
            <div className="mb-3">
              <h3 className="text-lg font-medium mb-1">Banner Preview</h3>
              <p className="text-sm text-muted-foreground">
                This shows how banners will appear on the home page.
              </p>
            </div>
            
            <div className="relative max-w-3xl mx-auto">
              <BannerSlider banners={banners} />
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              Note: Only active banners are displayed in the preview and on the home page.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default BannersManagement;
