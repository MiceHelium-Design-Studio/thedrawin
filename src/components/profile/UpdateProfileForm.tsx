
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
        return; // Upload failed, don't proceed with profile save
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={saving || uploading}
            >
              {saving ? 'Updating...' : 'Save Profile'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleReset}
              disabled={saving || uploading}
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
