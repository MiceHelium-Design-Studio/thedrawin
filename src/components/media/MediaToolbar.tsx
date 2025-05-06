
import React, { useRef } from 'react';
import { Search, SortAsc, SortDesc, Filter, RefreshCw, UploadCloud, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MediaToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void;
  onRefresh: () => void;
  onUpload: () => void;
  loading: boolean;
  isUploading: boolean;
  refreshing: boolean;
}

const MediaToolbar: React.FC<MediaToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  view,
  setView,
  onRefresh,
  onUpload,
  loading,
  isUploading,
  refreshing
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
      <h1 className="text-2xl font-bold mb-4 sm:mb-0">Media Library</h1>
      
      <div className="flex gap-2 w-full sm:w-auto">
        <Input 
          placeholder="Search files..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-gold/30 focus:border-gold"
          disabled={loading || isUploading}
        />

        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="border-gold/30 text-gold"
          disabled={loading || isUploading}
        >
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          className="border-gold/30 text-gold"
          disabled={loading || isUploading}
        >
          {view === 'grid' ? (
            <Filter className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onRefresh}
          className="border-gold/30 text-gold"
          disabled={loading || isUploading || refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>

        <Button 
          onClick={onUpload} 
          className="bg-gold hover:bg-gold-dark text-black"
          disabled={loading || isUploading}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
          ) : (
            <UploadCloud className="h-4 w-4 mr-2" />
          )}
          Upload
        </Button>
      </div>
    </div>
  );
};

export default MediaToolbar;
