
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';

interface ProfileImageSectionProps {
  imagePreview: string | null;
  avatarUrl: string | null;
  isEditing: boolean;
  uploading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({
  imagePreview,
  avatarUrl,
  isEditing,
  uploading,
  onImageChange
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="w-32 h-32 border-4 border-gray-200 transition-all duration-200 group-hover:border-blue-300">
          <AvatarImage 
            src={imagePreview || avatarUrl || ''} 
            alt="Profile" 
            className="object-cover"
          />
          <AvatarFallback className="text-2xl">
            <User className="w-12 h-12 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        
        {isEditing && (
          <button
            type="button"
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading}
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {isEditing && (
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />
      )}
      
      {uploading && (
        <p className="text-sm text-gray-600">Uploading image...</p>
      )}
    </div>
  );
};

export default ProfileImageSection;
