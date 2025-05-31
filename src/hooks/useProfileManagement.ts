
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  email: string;
}

export const useProfileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If no profile exists, create one
      if (!profileData) {
        const newProfile = {
          id: user.id,
          name: user.name || user.email || 'User',
          avatar_url: user.avatar_url || null,
          email: user.email || ''
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;

        setProfile({
          ...createdProfile,
          email: user.email || ''
        });
      } else {
        setProfile({
          ...profileData,
          email: user.email || ''
        });
      }

      // Set form state
      setName(profileData?.name || user.name || user.email || 'User');
      setEmail(user.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading profile',
        description: 'There was a problem loading your profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (avatarUrl?: string | null) => {
    if (!user || !profile) return false;

    try {
      setSaving(true);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name,
          avatar_url: avatarUrl !== undefined ? avatarUrl : profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update auth user metadata if needed
      if (user.email !== email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: email
        });

        if (authError) throw authError;
      }

      // Update local state
      setProfile({
        ...profile,
        name,
        avatar_url: avatarUrl !== undefined ? avatarUrl : profile.avatar_url,
        email
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'There was a problem saving your profile. Please try again.',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  };

  return {
    profile,
    loading,
    saving,
    name,
    setName,
    email,
    setEmail,
    saveProfile,
    resetForm
  };
};
