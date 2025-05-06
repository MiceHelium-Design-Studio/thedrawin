
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MediaErrorAlertProps {
  error: string | null;
}

const MediaErrorAlert: React.FC<MediaErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Card className="mb-4 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
      <CardContent className="p-4 flex items-center text-orange-700 dark:text-orange-400">
        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
        <p>{error}</p>
      </CardContent>
    </Card>
  );
};

export default MediaErrorAlert;
