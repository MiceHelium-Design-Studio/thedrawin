
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileDetailsForm from '@/components/profile/ProfileDetailsForm';
import WalletSection from '@/components/profile/WalletSection';

const Profile: React.FC = () => {
  const { user, logout, updateProfile, addFunds, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [unsplashUrl, setUnsplashUrl] = useState(user?.avatar_url || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatar || '');
      setUnsplashUrl(user.avatar_url || '');
    }
  }, [user]);
  
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'There was an error logging out.',
      });
      console.error(error);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ 
        name, 
        avatar: avatarUrl,
        avatar_url: unsplashUrl
      });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was an error updating your profile.',
      });
      console.error(error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <ProfileAvatar 
              user={user}
              isEditing={isEditing}
              avatarUrl={avatarUrl}
              unsplashUrl={unsplashUrl}
              setAvatarUrl={setAvatarUrl}
              setUnsplashUrl={setUnsplashUrl}
            />
            
            <ProfileDetailsForm 
              user={user}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              name={name}
              setName={setName}
              avatarUrl={avatarUrl}
              unsplashUrl={unsplashUrl}
              loading={loading}
              handleUpdateProfile={handleUpdateProfile}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <WalletSection 
            user={user}
            loading={loading}
            addFunds={addFunds}
          />
        </CardContent>
      </Card>
      
      <Button 
        variant="outline" 
        onClick={handleLogout}
        className="border-red-300 text-red-500 hover:text-red-700 w-full"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default Profile;
