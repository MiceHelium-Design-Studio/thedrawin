
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { uploadToS3 } from './s3Utils';
import { useDraws } from '../context/DrawContext';

// Function to upload a banner image and save it to the database
export async function uploadAndUpdateBanner(imageUrl: string, position: number = 0) {
  try {
    // First, fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch the image');
    }
    
    // Convert to a blob and then to a File object
    const blob = await response.blob();
    const file = new File([blob], 'gold-drawin-banner.png', { type: 'image/png' });
    
    // Upload to S3 using the existing uploadToS3 function
    const { url, key } = await uploadToS3(file, 'banners');
    
    console.log('Banner uploaded successfully:', url);
    
    // Check if a banner with this position already exists
    const { data: existingBanner } = await supabase
      .from('media_items')
      .select('*')
      .eq('name', `banner-${position}`)
      .single();
    
    // Generate a unique ID for the banner
    const bannerId = existingBanner?.id || `banner-${position}`;
    
    // Store banner info in media_items table
    const bannerData = {
      id: bannerId,
      name: `banner-${position}`,
      type: 'banner',
      url: url,
      user_id: (await supabase.auth.getUser()).data.user?.id || 'system',
      size: blob.size
    };
    
    const { error: updateError } = await supabase
      .from('media_items')
      .upsert(bannerData);
    
    if (updateError) {
      console.error('Error updating banner in database:', updateError);
      throw updateError;
    }
    
    toast({
      title: 'Banner Updated',
      description: 'The new banner image has been uploaded and saved.',
    });
    
    return { url, key };
  } catch (error) {
    console.error('Error uploading banner:', error);
    toast({
      variant: 'destructive',
      title: 'Update Failed',
      description: 'There was a problem updating the banner image.'
    });
    throw error;
  }
}

// Helper function to initialize the banner with the provided image
export async function initializeGoldBanner() {
  try {
    // Check if banner already exists
    const { data: existingBanner } = await supabase
      .from('media_items')
      .select('*')
      .eq('name', 'banner-1')
      .eq('type', 'banner')
      .single();
    
    if (existingBanner) {
      console.log('Banner already exists, skipping initialization');
      return;
    }
    
    // Use the uploaded image URL
    const imageUrl = '/lovable-uploads/d2810e9f-1964-48c4-97be-48553adb004f.png'; 
    
    return await uploadAndUpdateBanner(imageUrl, 1);
  } catch (error) {
    console.error('Error initializing gold banner:', error);
  }
}
