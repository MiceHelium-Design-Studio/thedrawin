
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, ImagePlus } from 'lucide-react';

interface ImageUploaderProps { 
  onImageSelected: (file: File) => void; 
  previewUrl?: string;
  isUploading?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelected, 
  previewUrl = '', 
  isUploading = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelected(files[0]);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full">
      {isUploading ? (
        <div className="flex items-center justify-center p-6 border border-gold/20 rounded-lg bg-black-light w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-2"></div>
            <p className="text-sm text-gold-light">Uploading image...</p>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="relative w-full">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border border-gold/20 shadow-[0_0_10px_rgba(0,0,0,0.2)]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-20 rounded-lg"></div>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="absolute top-2 right-2 bg-black/80 hover:bg-black border-gold/30 text-gold hover:text-gold-light"
            onClick={triggerFileInput}
          >
            <Edit className="h-4 w-4 mr-1" />
            Change
          </Button>
        </div>
      ) : (
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerFileInput}
          className="w-full flex items-center justify-center p-6 border-2 border-dashed border-gold/30 rounded-lg bg-black-light hover:bg-black hover:border-gold/50 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-10 w-10 text-gold/70" />
            <span className="text-sm text-gold-light">Click to select an image</span>
          </div>
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
