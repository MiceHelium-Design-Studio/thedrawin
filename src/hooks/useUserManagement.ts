
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { testSupabaseConnection } from '@/utils/supabaseTest';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [connectionErrorDetails, setConnectionErrorDetails] = useState<string | null>(null);

  const testConnection = async () => {
    const result = await testSupabaseConnection();
    setConnectionStatus(result.isConnected);
    setConnectionErrorDetails(result.errorDetails || null);
    return result;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      // First test the connection
      const connectionResult = await testConnection();
      if (!connectionResult.isConnected) {
        throw new Error(connectionResult.errorDetails || 'Could not connect to Supabase database');
      }
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      const mappedUsers = profilesData?.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name || undefined,
        avatar: profile.avatar || undefined,
        wallet: profile.wallet || 0,
        isAdmin: profile.is_admin || false,
        createdAt: profile.created_at
      })) || [];
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: error instanceof Error ? error.message : 'There was a problem loading the user list. Please try again later.'
      });
      
      setUsers([]);
      setFetchError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
      
      toast({
        title: 'Status updated',
        description: `Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully.`
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was a problem updating the admin status.'
      });
    }
  };

  const sendNotificationToUser = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message: 'Welcome to Gold Drawin! We hope you enjoy our platform.',
          type: 'system'
        });
      
      if (error) throw error;
      
      toast({
        title: 'Notification sent',
        description: `Welcome message sent to ${email}`
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Notification failed',
        description: 'There was a problem sending the notification.'
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchError,
    connectionStatus,
    connectionErrorDetails,
    fetchUsers,
    toggleAdminStatus,
    sendNotificationToUser,
    testConnection
  };
};
