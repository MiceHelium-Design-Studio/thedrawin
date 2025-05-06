
import { useState, useEffect } from 'react';
import { useDraws } from '../context/DrawContext';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadDate: string;
}

export const useMediaLibrary = () => {
  const { media = [], loading: mediaLoading, uploadMedia, deleteMedia } = useDraws();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [forceRender, setForceRender] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Force render after 3 seconds no matter what
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceRender(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If we're still loading after 3 seconds, we'll force render
  const loading = (mediaLoading) && !forceRender;

  useEffect(() => {
    // Reset load error when media loads successfully
    if (media.length > 0) {
      setLoadError(null);
    }
  }, [media.length]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      toast({
        title: 'Uploading...',
        description: `Uploading ${files[0].name} to S3 storage.`,
      });
      
      // Use the media bucket for the media library
      const uploadedItem = await uploadMedia(files[0], 'media');
      
      toast({
        title: 'File uploaded',
        description: `${uploadedItem.name} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your file to S3.',
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      toast({
        title: 'Deleting...',
        description: `Deleting ${name} from S3 storage.`,
      });
      
      // Use the media bucket for the media library
      await deleteMedia(id, 'media');
      
      toast({
        title: 'File deleted',
        description: `${name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: 'There was an error deleting your file from S3.',
      });
      console.error('Delete error:', error);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setLoadError(null);
    try {
      // Force reload of media items by setting loading to true
      // The DrawContext will handle the actual reloading
      setForceRender(false);
      setTimeout(() => setForceRender(true), 100);
      
      toast({
        title: 'Refreshed',
        description: 'Media library has been refreshed.'
      });
    } catch (error) {
      console.error('Error refreshing media:', error);
      setLoadError('Failed to refresh media library.');
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.className = e.currentTarget.className + ' opacity-50';
    if (!loadError) {
      setLoadError('Some media files failed to load. This may be due to incorrect permissions or deleted files.');
    }
  };

  const filteredMedia = (media || [])
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      } else {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });

  return {
    media: filteredMedia,
    loading,
    isUploading,
    refreshing,
    loadError,
    searchTerm,
    setSearchTerm,
    view,
    setView,
    sortOrder,
    setSortOrder,
    handleFileChange,
    handleDelete,
    handleRefresh,
    formatFileSize,
    handleImageError
  };
};
