
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileImageSection from '@/components/profile/ProfileImageSection';
import ProfileFormFields from '@/components/profile/ProfileFormFields';
import ProfileActionButtons from '@/components/profile/ProfileActionButtons';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useImageUpload } from '@/hooks/useImageUpload';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    profile,
    loading,
    saving,
    name,
    setName,
    email,
    setEmail,
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

  const handleSave = async () => {
    let avatarUrl = profile?.avatar_url;

    // Upload new image if one was selected
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        avatarUrl = uploadedUrl;
      }
    }

    const success = await saveProfile(avatarUrl);
    if (success) {
      clearImageState();
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    clearImageState();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Unable to load profile. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'Edit Profile' : 'My Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfileImageSection
              imagePreview={imagePreview}
              avatarUrl={profile.avatar_url}
              isEditing={isEditing}
              uploading={uploading}
              onImageChange={handleImageChange}
            />

            <ProfileFormFields
              name={name}
              email={email}
              isEditing={isEditing}
              onNameChange={(e) => setName(e.target.value)}
              onEmailChange={(e) => setEmail(e.target.value)}
            />

            <ProfileActionButtons
              isEditing={isEditing}
              saving={saving}
              uploading={uploading}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
