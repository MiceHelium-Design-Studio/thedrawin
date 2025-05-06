
import React, { useRef } from 'react';
import { Image } from 'lucide-react';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { Card } from '@/components/ui/card';
import MediaToolbar from '@/components/media/MediaToolbar';
import MediaGrid from '@/components/media/MediaGrid';
import MediaList from '@/components/media/MediaList';
import MediaErrorAlert from '@/components/media/MediaErrorAlert';
import MediaUploadingStatus from '@/components/media/MediaUploadingStatus';
import MediaEmptyState from '@/components/media/MediaEmptyState';

const MediaLibrary: React.FC = () => {
  const {
    media,
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
  } = useMediaLibrary();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Even if loading, we'll render the UI after 3 seconds with a visual loading indicator
  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <MediaToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        view={view}
        setView={setView}
        onRefresh={handleRefresh}
        onUpload={() => fileInputRef.current?.click()}
        loading={loading}
        isUploading={isUploading}
        refreshing={refreshing}
      />

      <MediaErrorAlert error={loadError} />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      )}
      
      <MediaUploadingStatus isUploading={isUploading && !loading} />

      {!loading && media.length === 0 ? (
        <MediaEmptyState 
          onUpload={() => fileInputRef.current?.click()} 
          isUploading={isUploading} 
        />
      ) : !loading && view === 'grid' ? (
        <MediaGrid 
          media={media} 
          onDelete={handleDelete} 
          onImageError={handleImageError}
          formatFileSize={formatFileSize}
        />
      ) : !loading && (
        <MediaList 
          media={media} 
          onDelete={handleDelete} 
          onImageError={handleImageError}
          formatFileSize={formatFileSize}
        />
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden"
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={isUploading}
      />
    </div>
  );
};

export default MediaLibrary;
