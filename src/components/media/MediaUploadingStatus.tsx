
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MediaUploadingStatusProps {
  isUploading: boolean;
}

const MediaUploadingStatus: React.FC<MediaUploadingStatusProps> = ({ isUploading }) => {
  if (!isUploading) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
          <div>
            <h3 className="font-medium">Uploading your file to S3...</h3>
            <p className="text-sm text-gray-500">Please wait while your file is being uploaded.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaUploadingStatus;
