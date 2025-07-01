import { supabase } from '@/integrations/supabase/client';

export interface DrawImageInfo {
  name: string;
  url: string;
  drawId?: string;
  uploadDate: string;
}

/**
 * Fetch all images from the draw_images storage bucket
 */
export async function getDrawImages(): Promise<DrawImageInfo[]> {
  try {
    console.log('Fetching images from draw_images bucket...');

    // First, try to list root directory
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('draw_images')
      .list('', {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (rootError) {
      console.error('Error fetching root draw images:', rootError);
      return [];
    }

    let allFiles: any[] = [];

    if (rootFiles && rootFiles.length > 0) {
      console.log('Found files in root:', rootFiles);

      // Check each item - could be files or folders
      for (const item of rootFiles) {
        if (item.name) {
          // If it's a file (has extension)
          if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.name)) {
            allFiles.push({ ...item, path: item.name });
          }
          // If it might be a folder (no extension), try to list its contents
          else if (!item.name.includes('.')) {
            console.log(`Checking folder: ${item.name}`);
            const { data: subFiles, error: subError } = await supabase.storage
              .from('draw_images')
              .list(item.name, {
                sortBy: { column: 'created_at', order: 'desc' }
              });

            if (!subError && subFiles) {
              console.log(`Found ${subFiles.length} files in ${item.name}`);
              subFiles.forEach(subFile => {
                if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(subFile.name)) {
                  allFiles.push({
                    ...subFile,
                    path: `${item.name}/${subFile.name}`,
                    created_at: subFile.created_at || item.created_at
                  });
                }
              });
            }
          }
        }
      }
    }

    console.log(`Total image files found: ${allFiles.length}`);

    // Transform to include public URLs
    const drawImages: DrawImageInfo[] = allFiles.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('draw_images')
        .getPublicUrl(file.path);

      console.log(`Generated URL for ${file.path}: ${publicUrl}`);

      return {
        name: file.name,
        url: publicUrl,
        uploadDate: file.created_at || new Date().toISOString()
      };
    });

    console.log(`Returning ${drawImages.length} draw images`);
    return drawImages;

  } catch (error) {
    console.error('Unexpected error fetching draw images:', error);
    return [];
  }
}

/**
 * Get the most recent image for a specific user (useful for matching to draws)
 */
export async function getUserDrawImages(userId: string): Promise<DrawImageInfo[]> {
  try {
    const { data: userFiles, error } = await supabase.storage
      .from('draw_images')
      .list(userId, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error || !userFiles) {
      console.log(`No images found for user ${userId}`);
      return [];
    }

    return userFiles
      .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name))
      .map(file => {
        const fullPath = `${userId}/${file.name}`;
        const { data: { publicUrl } } = supabase.storage
          .from('draw_images')
          .getPublicUrl(fullPath);

        return {
          name: file.name,
          url: publicUrl,
          uploadDate: file.created_at || new Date().toISOString()
        };
      });
  } catch (error) {
    console.error('Error fetching user draw images:', error);
    return [];
  }
}

/**
 * Match images to draws using multiple strategies
 * Since we don't have direct DB links, we use heuristics
 */
export function matchImagesToDraws(draws: any[], images: DrawImageInfo[]) {
  // Sort images by upload date (newest first)
  const sortedImages = [...images].sort((a, b) =>
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

  return draws.map((draw, index) => {
    let matchedImage: DrawImageInfo | undefined;

    // Strategy 1: Try to match by timing (within 2 hours)
    const drawDate = new Date(draw.createdAt || draw.startDate || Date.now());
    const timingMatches = sortedImages.filter(img => {
      const imgDate = new Date(img.uploadDate);
      const timeDiff = Math.abs(imgDate.getTime() - drawDate.getTime());
      return timeDiff < 2 * 60 * 60 * 1000; // 2 hours
    });

    if (timingMatches.length > 0) {
      matchedImage = timingMatches[0];
    } else {
      // Strategy 2: If no timing match, assign images in order
      // This helps when we have multiple draws and multiple images
      if (sortedImages[index] && !isImageAlreadyUsed(sortedImages[index], draws.slice(0, index))) {
        matchedImage = sortedImages[index];
      } else {
        // Strategy 3: Use any available unused image
        matchedImage = sortedImages.find(img =>
          !isImageAlreadyUsed(img, draws.slice(0, index))
        );
      }
    }

    return {
      ...draw,
      bannerImage: matchedImage?.url || draw.bannerImage,
      imageUrl: matchedImage?.url || draw.imageUrl,
      _matchedImageName: matchedImage?.name // For debugging
    };
  });
}

/**
 * Check if an image has already been assigned to a previous draw
 */
function isImageAlreadyUsed(image: DrawImageInfo, previousDraws: any[]): boolean {
  return previousDraws.some(draw =>
    draw.bannerImage === image.url || draw._matchedImageName === image.name
  );
}

/**
 * Alternative matching: Just assign the most recent image to the most recent draw
 */
export function assignRecentImageToDraws(draws: any[], images: DrawImageInfo[]) {
  if (images.length === 0) return draws;

  // Sort both by creation date
  const sortedDraws = [...draws].sort((a, b) =>
    new Date(b.createdAt || b.startDate || 0).getTime() -
    new Date(a.createdAt || a.startDate || 0).getTime()
  );

  const sortedImages = [...images].sort((a, b) =>
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

  return draws.map(draw => {
    const drawIndex = sortedDraws.findIndex(d => d.id === draw.id);
    const image = sortedImages[drawIndex] || sortedImages[0]; // Use most recent if not enough images

    return {
      ...draw,
      bannerImage: image?.url || draw.bannerImage,
      imageUrl: image?.url || draw.imageUrl
    };
  });
} 