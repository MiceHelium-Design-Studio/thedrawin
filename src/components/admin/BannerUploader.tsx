
import React, { useEffect, useState } from 'react';
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
        description: 'The gold DRAWIN banner has been updated.',
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Update Banner</CardTitle>
        <CardDescription>
          Replace the current banner with the gold DRAWIN bar image.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
          <img 
            src="/lovable-uploads/d2810e9f-1964-48c4-97be-48553adb004f.png" 
            alt="Gold DRAWIN Bar" 
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpdateBanner} 
          disabled={isUploading || isComplete}
          className="w-full"
        >
          {isUploading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isComplete ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Banner Updated
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Update Banner
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BannerUploader;
