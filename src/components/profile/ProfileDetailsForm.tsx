
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon } from 'lucide-react'; // Import the User icon from lucide-react
import { User } from '@/types'; // Import the User type
import { useTranslation } from 'react-i18next';

interface ProfileDetailsFormProps {
  user: User | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  name: string;
  setName: (name: string) => void;
  avatarUrl: string;
  unsplashUrl: string;
  loading: boolean;
  handleUpdateProfile: () => Promise<void>;
}

const ProfileDetailsForm: React.FC<ProfileDetailsFormProps> = ({
  user,
  isEditing,
  setIsEditing,
  name,
  setName,
  avatarUrl,
  unsplashUrl,
  loading,
  handleUpdateProfile,
}) => {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="flex-1">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t('profile.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gold/30 focus:border-gold"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="bg-gold hover:bg-gold-dark text-black"
            >
              {t('profile.save')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="border-gold/30 text-gold hover:text-gold-dark"
            >
              {t('profile.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">{t('profile.name')}</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">{t('profile.email')}</p>
            <p className="font-medium">{user.email}</p>
          </div>

          {user.avatar_url && (
            <div>
              <p className="text-sm text-gray-500">{t('profile.avatar.usingUnsplashAvatar')}</p>
              <p className="font-medium text-xs text-gold truncate">{user.avatar_url}</p>
            </div>
          )}

          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gold hover:bg-gold-dark text-black"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            {t('profile.actions.editProfile')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileDetailsForm;
