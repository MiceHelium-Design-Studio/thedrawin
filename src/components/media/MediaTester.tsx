
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Upload, RefreshCw, Image as ImageIcon, Trash2 } from 'lucide-react';
import { uploadToS3, getMediaItems, deleteFromS3 } from '@/utils/s3Utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/types';

const MediaTester: React.FC = () => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const fetchMediaItems = async () => {
    setIsLoading(true);
    try {
      // Test if we can access our media items
      const items = await getMediaItems();
      console.log('Media items fetched:', items);
      
      // Convert the returned items to match the MediaItem interface
      const formattedItems: MediaItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        type: item.type,
        size: item.size,
        user_id: item.user_id || user?.id || '',
        uploadDate: item.uploadDate || new Date().toISOString()
      }));
      
      setMediaItems(formattedItems);
      
      // Also test direct Supabase query to check RLS policies
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('upload_date', { ascending: false });
        
      if (error) {
        console.error('Supabase query error:', error);
        toast({
          title: 'Error fetching media',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        console.log('Supabase direct query result:', data);
      }
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({
        title: 'Error fetching media',
        description: 'Could not fetch media items. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMediaItems();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    
    setIsUploading(true);
    try {
      const result = await uploadToS3(uploadFile);
      console.log('Upload result:', result);
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      fetchMediaItems();
      setUploadFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFromS3(id);
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
      fetchMediaItems();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">Media Upload Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <Input 
              type="file" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button 
              onClick={handleUpload} 
              disabled={!uploadFile || isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          {uploadFile && (
            <p className="text-sm text-muted-foreground">Selected file: {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Media</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMediaItems}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading media items...</div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No media items found. Upload some files to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mediaItems.map(item => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  {item.type.includes('image') ? (
                    <div className="aspect-square overflow-hidden rounded-md border bg-muted">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline">
                        {Math.round(item.size / 1024)} KB
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaTester;
