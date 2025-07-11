
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadAvatar } from '@/utils/uploadAvatar';
import { updateUserProfile } from '@/utils/updateUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CompleteProfileForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: t('profile.messages.fileTooLarge'),
          description: t('profile.messages.fileTooLargeDesc'),
        });
        return;
      }

      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: t('profile.messages.invalidFileType'),
          description: t('profile.messages.invalidFileTypeDesc'),
        });
        return;
      }

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        variant: 'destructive',
        title: t('profile.messages.nameRequired'),
        description: t('profile.messages.nameRequiredDesc'),
      });
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error(t('profile.messages.userNotAuthenticated'));
      }

      console.log('Starting profile completion for user:', authUser.id);

      let avatarUrl = '';
      if (file) {
        console.log('Uploading avatar file:', file.name);
        avatarUrl = await uploadAvatar(file, authUser.id);
        console.log('Avatar uploaded successfully:', avatarUrl);
      }

      console.log('Updating user profile with data:', { full_name: fullName, avatar_url: avatarUrl });
      await updateUserProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      // Update the auth context with the new profile data
      if (updateProfile) {
        await updateProfile({
          name: fullName,
          avatar_url: avatarUrl
        });
      }

      toast({
        title: t('profile.messages.profileCompleted'),
        description: t('profile.messages.profileCompletedDesc'),
      });

      // Navigate to the home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        variant: 'destructive',
        title: t('profile.messages.errorSavingProfile'),
        description: error instanceof Error ? error.message : t('profile.messages.errorSavingProfileDesc'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('profile.completeProfile.title')}
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            {t('profile.completeProfile.subtitle')}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center transition-all duration-200 group-hover:border-blue-300">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={t('profile.completeProfile.avatarPreview')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                  onClick={() => document.getElementById('avatar')?.click()}
                  disabled={isLoading}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 text-center">
                {t('profile.completeProfile.uploadPicture')}
              </p>
            </div>

            {/* Full Name Input */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white font-medium">
                {t('profile.completeProfile.fullName')}
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder={t('profile.completeProfile.fullNamePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                required
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading || !fullName.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('profile.completeProfile.settingUp')}
                  </>
                ) : (
                  t('profile.completeProfile.completeButton')
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 transition-colors duration-200"
                onClick={handleSkip}
                disabled={isLoading}
              >
                {t('profile.completeProfile.skipButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfileForm;
