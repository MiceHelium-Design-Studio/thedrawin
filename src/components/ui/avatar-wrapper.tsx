
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface AvatarWrapperProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

const AvatarWrapper: React.FC<AvatarWrapperProps> = ({ 
  src, 
  alt = "User avatar", 
  fallback,
  className 
}) => {
  const [imageError, setImageError] = useState(false);
  const [key, setKey] = useState(Date.now()); // Add a key to force re-render when src changes

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setKey(Date.now());
    console.log("Avatar source changed:", src);
  }, [src]);

  const handleImageError = () => {
    console.log("Avatar image failed to load:", src);
    setImageError(true);
  };

  const getFallbackText = (): string => {
    if (fallback) return fallback;
    if (alt && typeof alt === 'string') {
      const nameParts = alt.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return alt.substring(0, 2).toUpperCase();
    }
    return '';
  };

  return (
    <Avatar className={className}>
      {src && !imageError ? (
        <AvatarImage 
          key={key}
          src={src} 
          alt={alt || ''} 
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary">
        {getFallbackText() || <User className="h-5 w-5" />}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarWrapper;
