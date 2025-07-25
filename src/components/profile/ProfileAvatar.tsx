
import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToS3 } from '@/utils/s3Utils';
import { useTranslation } from 'react-i18next';

interface ProfileAvatarProps {
  user: {
    name?: string;
    avatar?: string;
    avatar_url?: string;
  };
  isEditing: boolean;
  avatarUrl: string;
  unsplashUrl: string;
  setAvatarUrl: (url: string) => void;
  setUnsplashUrl: (url: string) => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  user,
  isEditing,
  avatarUrl,
  unsplashUrl,
  setAvatarUrl,
  setUnsplashUrl,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsplashInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);

      const { url, name } = await uploadToS3(files[0], 'profile_images');
      setAvatarUrl(url);

      toast({
        title: t('profile.messages.imageUploaded'),
        description: t('profile.messages.imageUploadedDesc', { name }),
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('profile.messages.uploadFailed'),
        description: t('profile.messages.uploadFailedDesc'),
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUnsplashUrlUpdate = () => {
    if (!unsplashInputRef.current?.value) {
      toast({
        variant: 'destructive',
        title: t('profile.messages.invalidUrl'),
        description: t('profile.messages.invalidUrlDesc'),
      });
      return;
    }

    setUnsplashUrl(unsplashInputRef.current.value);
    toast({
      title: t('profile.messages.unsplashUrlAdded'),
      description: t('profile.messages.unsplashUrlAddedDesc'),
    });
  };

  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        {/* Show Unsplash avatar if available, otherwise fall back to uploaded avatar */}
        <AvatarImage src={unsplashUrl || user.avatar_url || user.avatar} alt={user.name} />
        <AvatarFallback className="text-lg bg-gold/20">
          {user.name?.slice(0, 2) || 'U'}
        </AvatarFallback>
      </Avatar>
      {isEditing && (
        <div className="absolute -bottom-2 -right-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full w-8 h-8 p-0 bg-background border-gold/30"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 text-gold" />
          </Button>
        </div>
      )}

      {isEditing && (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="avatar">{t('profile.avatar.avatarUrl')}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="border-gold/30 focus:border-gold"
                  placeholder={t('profile.avatar.urlPlaceholder')}
                />
              </div>
              <Button
                variant="outline"
                className="border-gold/30 text-gold hover:text-gold-dark"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('profile.upload')}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Unsplash URL input */}
          <div>
            <Label htmlFor="unsplashUrl">{t('profile.avatar.unsplashUrl')}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="unsplashUrl"
                  ref={unsplashInputRef}
                  defaultValue={unsplashUrl}
                  className="border-gold/30 focus:border-gold"
                  placeholder={t('profile.avatar.unsplashPlaceholder')}
                />
              </div>
              <Button
                variant="outline"
                className="border-gold/30 text-gold hover:text-gold-dark"
                onClick={handleUnsplashUrlUpdate}
              >
                <Image className="h-4 w-4 mr-2" />
                {t('profile.avatar.addUrl')}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {t('profile.avatar.exampleUrl')}
            </p>
          </div>

          {/* Preview section for both types of images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avatarUrl && (
              <div className="mt-2 w-full overflow-hidden rounded border border-gray-200">
                <p className="text-xs text-gray-400 p-1 bg-black-light/30">{t('profile.avatar.uploadedAvatar')}</p>
                <img src={avatarUrl} alt={t('profile.avatar.uploadedAvatar')} className="w-full object-cover max-h-40" />
              </div>
            )}

            {unsplashUrl && (
              <div className="mt-2 w-full overflow-hidden rounded border border-gray-200">
                <p className="text-xs text-gray-400 p-1 bg-black-light/30">{t('profile.avatar.unsplashAvatar')}</p>
                <img
                  src={unsplashUrl}
                  alt={t('profile.avatar.unsplashAvatar')}
                  className="w-full object-cover max-h-40"
                  onError={(e) => {
                    toast({
                      variant: 'destructive',
                      title: t('profile.messages.invalidImageUrl'),
                      description: t('profile.messages.invalidImageUrlDesc')
                    });
                    e.currentTarget.src = "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
