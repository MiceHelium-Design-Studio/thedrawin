
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
      // If profile doesn't exist, that's not necessarily an error
      if (error.code === 'PGRST116') {
        console.log('User profile not found, will create one');
        return null;
      }
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
  try {
    console.log('Creating user profile for:', authUser.id, authUser.email);
    
    const profileData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      avatar: authUser.user_metadata?.avatar_url || null,
      wallet: 500, // Starting wallet amount
      is_admin: authUser.email === 'raghidhilal@gmail.com' // Special admin case
    };

    console.log('Profile data to insert:', profileData);

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      // Check if the error is due to duplicate key (user already exists)
      if (error.code === '23505') {
        console.log('User profile already exists, fetching existing profile');
        return await fetchUser(authUser.id);
      }
      console.error('Error creating user profile:', error);
      return null;
    }

    console.log('Successfully created user profile:', data.id);
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
    
    // If profile creation fails, try to fetch existing profile
    console.log('Profile creation failed, attempting to fetch existing profile');
    return await fetchUser(authUser.id);
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
