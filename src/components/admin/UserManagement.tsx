import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, UserCog, UserX, Shield, Mail } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      // Fetch users with admin role check
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, avatar, wallet, is_admin, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        setFetchError(error.message);
        throw error;
      }
      
      // Map the database response to match our User interface
      const mappedUsers = data?.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
        wallet: user.wallet || 0,
        isAdmin: user.is_admin || false,
        createdAt: user.created_at
      })) || [];
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: 'There was a problem loading the user list. Please try again later.'
      });
      
      // Set empty users array to avoid showing stale data
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
      
      // Update local state
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
      // Create a notification
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

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Number of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Users with admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.filter(user => user.isAdmin).length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Regular Users</CardTitle>
            <CardDescription>Users without admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.filter(user => !user.isAdmin).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Admin Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found. {fetchError ? `An error occurred: ${fetchError}` : ""}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name || user.email} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserCog className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <span>{user.name || 'User'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={user.isAdmin} 
                        onCheckedChange={() => toggleAdminStatus(user.id, user.isAdmin)}
                      />
                      <span className={user.isAdmin ? 'text-green-600' : 'text-gray-500'}>
                        {user.isAdmin ? 'Admin' : 'Regular User'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendNotificationToUser(user.id, user.email)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Notify
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default UserManagement;
