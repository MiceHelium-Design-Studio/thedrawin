
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const fetchUser = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) return null;

    // Map the database fields to our User type
    return {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      avatar: data.avatar || undefined,
      avatar_url: data.avatar_url || undefined,
      wallet: data.wallet || 0,
      isAdmin: data.is_admin || false, // Convert is_admin to isAdmin
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Unexpected error in fetchUser:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<boolean> => {
  try {
    // Update profile data including the new avatar_url field if present
    const updateData: any = {
      name: data.name,
      avatar: data.avatar,
    };
    
    // Only add avatar_url if it's provided in the update data
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
    // Note: We need to map isAdmin to is_admin when updating the database
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
  const isFullAdmin = email === 'raghidhilal@gmail.com'; // Special case for this email
  
  // FOR DEMO: Creating minimal user with admin rights
  return {
    id: session.user.id,
    email: email,
    name: session.user?.user_metadata?.name || 'Demo User',
    wallet: 500, // Give some funds to test
    isAdmin: isFullAdmin || true, // Make user admin
    avatar: session.user?.user_metadata?.avatar || null,
    avatar_url: null // Initialize the new field
  };
};
