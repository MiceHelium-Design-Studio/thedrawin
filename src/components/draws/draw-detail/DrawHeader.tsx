
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DrawHeaderProps {
  title: string;
  description: string;
  bannerImage?: string;
}

export const DrawHeader = ({ title, description, bannerImage }: DrawHeaderProps) => {
  const navigate = useNavigate();
  
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
        {bannerImage && (
          <div className="h-48 bg-gray-100">
            <img
              src={bannerImage}
              alt={title}
              className="h-full w-full object-cover"
            />
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
