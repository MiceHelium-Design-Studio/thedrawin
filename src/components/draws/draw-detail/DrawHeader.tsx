
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface DrawHeaderProps {
  title: string;
  description: string;
  bannerImage?: string;
}

export const DrawHeader = ({ title, description, bannerImage }: DrawHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
    toast({
      variant: 'destructive',
      title: 'Image failed to load',
      description: 'The banner image could not be displayed.'
    });
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')} 
        className="mb-4 pl-0 flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
      
      <Card className="overflow-hidden">
        {bannerImage && !imageError ? (
          <div className="h-48 bg-gray-100 relative">
            <img
              src={bannerImage}
              alt={title}
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-r from-gold/20 to-black/40 flex items-center justify-center">
            {imageError ? (
              <div className="text-center text-white p-4">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-gold/60" />
                <p>Banner image could not be loaded</p>
              </div>
            ) : (
              <div className="text-center text-white p-4">
                <p>No banner image available</p>
              </div>
            )}
          </div>
        )}
        
        <CardContent className="p-4">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        </CardContent>
      </Card>
    </>
  );
};
