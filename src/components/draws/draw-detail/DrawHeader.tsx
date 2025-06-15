
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, AlertTriangle, Image } from 'lucide-react';
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
  
  // Default Unsplash image to use if no banner is provided or if there's an error
  const defaultImage = "https://images.unsplash.com/photo-1610375461246-83df859d849d";
  
  const handleImageError = () => {
    setImageError(true);
    toast({
      variant: 'destructive',
      title: 'Image failed to load',
      description: 'Using default image as fallback.'
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
        <div className="p-4">
          <div className="luxury-card overflow-hidden">
            <div className="h-48 relative">
              <img
                src={bannerImage || defaultImage}
                alt={title}
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        </CardContent>
      </Card>
    </>
  );
};
