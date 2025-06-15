
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
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
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
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
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg py-2.5 font-medium transition-all duration-200"
              disabled={saving || uploading}
            >
              {saving || uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {uploading ? 'Uploading...' : 'Updating...'}
                </div>
              ) : (
                'Save Profile'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleReset}
              disabled={saving || uploading}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateProfileForm;
