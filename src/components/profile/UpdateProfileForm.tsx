
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw } from 'lucide-react';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useImageUpload } from '@/hooks/useImageUpload';
import ProfileImageSection from './ProfileImageSection';

const UpdateProfileForm: React.FC = () => {
  const {
    profile,
    name,
    setName,
    email,
    setEmail,
    saving,
    saveProfile,
    resetForm
  } = useProfileManagement();

  const {
    imageFile,
    imagePreview,
    uploading,
    handleImageChange,
    uploadImage,
    clearImageState
  } = useImageUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let avatarUrl: string | null = null;

    if (imageFile) {
      console.log('Uploading new profile image...');
      avatarUrl = await uploadImage();
      if (!avatarUrl) {
        console.error('Image upload failed, aborting profile save');
        return;
      }
      console.log('Image uploaded successfully:', avatarUrl);
    }

    const success = await saveProfile(avatarUrl);
    if (success) {
      clearImageState();
      console.log('Profile updated successfully');
    }
  };

  const handleReset = () => {
    resetForm();
    clearImageState();
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Update Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProfileImageSection
            imagePreview={imagePreview}
            avatarUrl={profile?.avatar_url || null}
            isEditing={true}
            uploading={uploading}
            onImageChange={handleImageChange}
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-white">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="premium-outline-button group flex-1"
              disabled={saving || uploading}
            >
              {saving || uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {uploading ? 'Uploading...' : 'Updating...'}
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Save Profile
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving || uploading}
              className="premium-outline-button group"
            >
              <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateProfileForm;
