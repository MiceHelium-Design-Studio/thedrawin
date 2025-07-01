import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getDrawImages } from '@/utils/drawImageUtils';
import { useDraws } from '@/context/DrawContext';

const StorageDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { draws } = useDraws();

  const checkStorage = async () => {
    setLoading(true);
    try {
      console.log('=== STORAGE DEBUG START ===');

      // Check 1: List all buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets);
      console.log('Buckets error:', bucketsError);

      // Check 2: List files in draw_images bucket (root level)
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('draw_images')
        .list('');
      console.log('Root files in draw_images:', rootFiles);
      console.log('Root files error:', rootError);

      // Check 3: List files in all subdirectories
      let allFiles: any[] = [];
      if (rootFiles) {
        for (const item of rootFiles) {
          if (item.name && !item.name.includes('.')) {
            // This might be a folder, try to list its contents
            const { data: subFiles, error: subError } = await supabase.storage
              .from('draw_images')
              .list(item.name);
            console.log(`Files in ${item.name}:`, subFiles);
            if (subFiles) {
              allFiles.push(...subFiles.map(f => ({ ...f, path: `${item.name}/${f.name}` })));
            }
          } else {
            // This is a file
            allFiles.push({ ...item, path: item.name });
          }
        }
      }

      // Check 4: Use our utility function
      const utilityImages = await getDrawImages();
      console.log('Images from utility function:', utilityImages);

      // Check 5: Current draws
      console.log('Current draws:', draws);

      const info = {
        buckets: buckets || [],
        bucketsError,
        rootFiles: rootFiles || [],
        rootError,
        allFiles,
        utilityImages,
        drawsCount: draws.length,
        drawsWithImages: draws.filter(d => d.bannerImage).length
      };

      setDebugInfo(info);
      console.log('=== DEBUG INFO ===', info);
      console.log('=== STORAGE DEBUG END ===');

    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Storage Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkStorage} disabled={loading}>
          {loading ? 'Checking Storage...' : 'Debug Storage'}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Buckets ({debugInfo.buckets?.length || 0})</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.buckets, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Root Files in draw_images ({debugInfo.rootFiles?.length || 0})</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.rootFiles, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">All Files Found ({debugInfo.allFiles?.length || 0})</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.allFiles, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Utility Function Result ({debugInfo.utilityImages?.length || 0})</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo.utilityImages, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Draws Status</h3>
              <p>Total draws: {debugInfo.drawsCount}</p>
              <p>Draws with images: {debugInfo.drawsWithImages}</p>
            </div>

            {debugInfo.error && (
              <div className="text-red-600">
                <h3 className="font-semibold">Error</h3>
                <p>{debugInfo.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageDebugger; 