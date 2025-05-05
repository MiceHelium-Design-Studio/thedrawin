
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeGoldBanner } from '../../utils/bannerUtils';
import { useToast } from '@/hooks/use-toast';
import { Upload, Check, RefreshCw } from 'lucide-react';

const BannerUploader: React.FC = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleUpdateBanner = async () => {
    setIsUploading(true);
    setIsComplete(false);
    
    try {
      await initializeGoldBanner();
      setIsComplete(true);
      toast({
        title: 'Success!',
        description: 'The premium gold DRAWIN banner has been updated.',
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was a problem updating the banner.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-gold/30 bg-black shadow-[0_0_15px_rgba(212,175,55,0.15)]">
      <CardHeader>
        <CardTitle className="text-gold">Update Premium Banner</CardTitle>
        <CardDescription className="text-gold-light">
          Replace the current banner with the premium gold DRAWIN bar image.
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
            Premium
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpdateBanner} 
          disabled={isUploading || isComplete}
          className="w-full bg-gold hover:bg-gold-dark text-black font-bold"
        >
          {isUploading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin text-black" />
              Uploading...
            </>
          ) : isComplete ? (
            <>
              <Check className="mr-2 h-4 w-4 text-black" />
              Banner Updated
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4 text-black" />
              Update Premium Banner
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BannerUploader;
