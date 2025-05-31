import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const fetchUser = async (userId: string): Promise<User | null> => {
  try {
    console.log('Fetching user profile for:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      console.log('No profile data returned');
      return null;
    }

    console.log('Successfully fetched user profile:', data.id);
    // Map the database fields to our User type
    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      avatar: data.avatar || undefined,
      avatar_url: data.avatar_url || undefined,
      wallet: data.wallet || 0,
      isAdmin: data.is_admin || false,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Unexpected error in fetchUser:', error);
    return null;
  }
};

export const createUserProfile = async (authUser: any): Promise<User | null> => {
  // With the new trigger, profiles should be created automatically
  // This function now just fetches the profile that should have been created
  try {
    console.log('Profile should have been created by trigger, fetching for:', authUser.id);
    
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userProfile = await fetchUser(authUser.id);
    
    if (userProfile) {
      console.log('Successfully retrieved auto-created profile:', userProfile.id);
      return userProfile;
    }
    
    console.log('Profile not found after trigger, creating manually as fallback');
    
    // Fallback: create profile manually if trigger failed
    const profileData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      avatar: authUser.user_metadata?.avatar_url || null,
      wallet: 500,
      is_admin: authUser.email === 'raghidhilal@gmail.com'
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile manually:', error);
      return null;
    }

    console.log('Successfully created user profile manually:', data.id);
    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      avatar: data.avatar || undefined,
      avatar_url: data.avatar_url || undefined,
      wallet: data.wallet || 0,
      isAdmin: data.is_admin || false,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<boolean> => {
  try {
    const updateData: any = {
      name: data.name,
      avatar: data.avatar,
    };
    
    if (data.avatar_url) {
      updateData.avatar_url = data.avatar_url;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('Update profile error:', error);
    return false;
  }
};

export const addUserFunds = async (userId: string, amount: number): Promise<boolean> => {
  try {
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('wallet')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const newAmount = (currentUser.wallet || 0) + amount;
    
    const { error } = await supabase
      .from('profiles')
      .update({ wallet: newAmount })
      .eq('id', userId);

    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Add funds error:', error);
    return false;
  }
};

export const updateUserAdminStatus = async (email: string, isAdmin: boolean): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('update_user_admin_status', {
      user_email: email,
      is_admin_status: isAdmin
    });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Make admin error:', error);
    return false;
  }
};

export const createDemoUser = (session: any): User => {
  const email = session.user.email || '';
  const isFullAdmin = email === 'raghidhilal@gmail.com';
  
  return {
    id: session.user.id,
    email: email,
    name: session.user?.user_metadata?.name || 'Demo User',
    wallet: 500,
    isAdmin: isFullAdmin || true,
    avatar: session.user?.user_metadata?.avatar || null,
    avatar_url: null
  };
};
