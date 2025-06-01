
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
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use maybeSingle for better error handling
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Create profile from user data if fetch fails
        const fallbackProfile = {
          id: user.id,
          name: user.name || user.email || 'User',
          avatar_url: user.avatar_url || null,
          email: user.email || ''
        };
        setProfile(fallbackProfile);
        setName(fallbackProfile.name);
        setEmail(fallbackProfile.email);
        return;
      }

      // If no profile exists, create one from user data
      if (!profileData) {
        const newProfile = {
          id: user.id,
          name: user.name || user.email || 'User',
          avatar_url: user.avatar_url || null,
          email: user.email || ''
        };

        setProfile(newProfile);
        setName(newProfile.name);
        setEmail(newProfile.email);
      } else {
        const profile = {
          ...profileData,
          email: user.email || profileData.email || ''
        };
        setProfile(profile);
        setName(profile.name || user.name || user.email || 'User');
        setEmail(profile.email);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to user data
      if (user) {
        const fallbackProfile = {
          id: user.id,
          name: user.name || user.email || 'User',
          avatar_url: user.avatar_url || null,
          email: user.email || ''
        };
        setProfile(fallbackProfile);
        setName(fallbackProfile.name);
        setEmail(fallbackProfile.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (avatarUrl?: string | null) => {
    if (!user || !profile) return false;

    try {
      setSaving(true);

      console.log('Saving profile with avatar URL:', avatarUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          email: user.email || email,
          avatar_url: avatarUrl !== undefined ? avatarUrl : profile.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Update auth user metadata if email changed
      if (user.email !== email) {
        try {
          const { error: authError } = await supabase.auth.updateUser({
            email: email
          });

          if (authError) {
            console.error('Auth update error:', authError);
          }
        } catch (authError) {
          console.error('Auth operation failed:', authError);
        }
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

      console.log('Profile saved successfully');
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
