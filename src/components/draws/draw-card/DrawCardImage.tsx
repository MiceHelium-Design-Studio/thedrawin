
import React from 'react';
import { getStatusBadgeColor, getStatusLabel } from './utils';

interface DrawCardImageProps {
  bannerImage?: string;
  title: string;
  status: string;
}

const DrawCardImage: React.FC<DrawCardImageProps> = ({ bannerImage, title, status }) => {
  if (!bannerImage) return null;

  return (
    <div className="relative">
      <div className="aspect-[2/1] w-full overflow-hidden p-4">
        <div className="w-full h-full overflow-hidden rounded-3xl shadow-lg border border-white/10">
          <img 
            src={bannerImage} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className={`absolute top-6 right-6 ${getStatusBadgeColor(status)} text-white text-xs font-bold py-1 px-2 rounded-full`}>
        {getStatusLabel(status)}
      </div>
    </div>
  );
};

export default DrawCardImage;
