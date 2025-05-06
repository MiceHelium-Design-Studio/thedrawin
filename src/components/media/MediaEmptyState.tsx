
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

interface MediaEmptyStateProps {
  onUpload: () => void;
  isUploading: boolean;
}

const MediaEmptyState: React.FC<MediaEmptyStateProps> = ({ onUpload, isUploading }) => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-gray-500">No media files found in S3 storage.</p>
        {!isUploading && (
          <Button 
            className="mt-4 bg-gold hover:bg-gold-dark text-black"
            onClick={onUpload}
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload your first file
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaEmptyState;
