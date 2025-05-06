
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { uploadToS3 } from './s3Utils';

const DEMO_IMAGES = [
  {
    id: 'gold-coins-1',
    url: '/lovable-uploads/d2810e9f-1964-48c4-97be-48553adb004f.png',
    description: 'Gold Coins Stack'
  },
  {
    id: 'gold-banner-1',
    url: '/lovable-uploads/e0c90449-0e21-4fa2-8656-efdf3f993ce8.png',
    description: 'Gold Draw Logo Banner'
  },
  {
    id: 'lottery-1',
    url: '/lovable-uploads/a3f55f49-2874-4022-824b-6b3cd22c8837.png',
    description: 'Lottery Winning Concept'
  },
  {
    id: 'coins-banner-1',
    url: '/lovable-uploads/3ba1bfaf-88ef-41ce-8abf-beb7e1144481.png',
    description: 'Gold Coins Banner'
  },
  {
    id: 'coins-banner-2',
    url: '/lovable-uploads/20718937-5630-4106-a72c-45e89d7d0310.png',
    description: 'Gold Coins and Trophy Banner'
  }
];

export async function initializeDemoImages() {
  try {
    console.log('Starting initialization of demo images...');
    // Check if we already have some images
    const { data: existingMedia } = await supabase
      .from('media_items')
      .select('*')
      .limit(1);
    
    if (existingMedia && existingMedia.length > 0) {
      console.log('Media items already exist, skipping initialization');
      return;
    }
    
    toast({
      title: 'Initializing demo images',
      description: 'Adding sample images to your library...',
    });
    
    // Upload demo images one by one
    for (const demoImage of DEMO_IMAGES) {
      try {
        console.log(`Processing demo image: ${demoImage.id}`);
        // First, fetch the image
        const response = await fetch(demoImage.url);
        if (!response.ok) {
          console.error(`Failed to fetch image: ${demoImage.url}`);
          continue;
        }
        
        // Convert to a blob and then to a File object
        const blob = await response.blob();
        const fileName = `${demoImage.id}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        
        // Upload to S3 using the existing uploadToS3 function
        await uploadToS3(file, 'media');
        
        console.log(`Successfully uploaded: ${fileName}`);
      } catch (imageError) {
        console.error(`Error processing image ${demoImage.id}:`, imageError);
      }
    }
    
    console.log('Demo images initialization complete');
    toast({
      title: 'Demo images added',
      description: 'Sample images have been added to your media library.',
    });
  } catch (error) {
    console.error('Error initializing demo images:', error);
    toast({
      variant: 'destructive',
      title: 'Initialization Failed',
      description: 'There was a problem adding demo images.',
    });
  }
}

// Initialize sample banners from the media library
export async function initializeDemoBanners() {
  try {
    console.log('Starting initialization of demo banners...');
    
    // Check if we already have some banners
    const { data: existingBanners } = await supabase
      .from('media_items')
      .select('*')
      .eq('type', 'banner')
      .limit(1);
    
    if (existingBanners && existingBanners.length > 0) {
      console.log('Banners already exist, skipping initialization');
      return;
    }
    
    // Get media items that could be used as banners
    const { data: mediaItems } = await supabase
      .from('media_items')
      .select('*')
      .eq('type', 'image');
      
    if (!mediaItems || mediaItems.length === 0) {
      console.log('No media items found for banner creation');
      return;
    }
    
    // Use up to 3 images as banners
    const bannerImages = mediaItems.slice(0, 3);
    
    for (let i = 0; i < bannerImages.length; i++) {
      const item = bannerImages[i];
      try {
        // Store banner info in media_items table as a banner type
        const bannerData = {
          id: `banner-${i + 1}`,
          name: `banner-${i + 1}`,
          type: 'banner',
          url: item.url,
          user_id: item.user_id || (await supabase.auth.getUser()).data.user?.id || 'system',
          size: item.size || 0
        };
        
        const { error } = await supabase
          .from('media_items')
          .upsert(bannerData);
        
        if (error) {
          console.error('Error creating banner:', error);
        } else {
          console.log(`Banner ${i + 1} created successfully`);
        }
      } catch (bannerError) {
        console.error(`Error creating banner ${i + 1}:`, bannerError);
      }
    }
    
    console.log('Demo banners initialization complete');
  } catch (error) {
    console.error('Error initializing demo banners:', error);
  }
}
