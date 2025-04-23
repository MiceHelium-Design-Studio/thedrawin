import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserCog, Mail, UserRound, Wallet, PlusCircle } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [walletAmount, setWalletAmount] = useState<string>('100');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { toast } = useToast();
  const { clearCacheAndReload } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Fetched profiles:', profilesData);
      
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
        description: 'There was a problem loading the user list. Please try again later.'
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

  const addWalletFunds = async (userId: string, amount: number) => {
    if (!selectedUserId || !walletAmount || parseInt(walletAmount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount to add.'
      });
      return;
    }

    try {
      const userToUpdate = users.find(u => u.id === userId);
      
      if (!userToUpdate) {
        throw new Error('User not found');
      }

      const newWalletAmount = userToUpdate.wallet + amount;
      
      const { error } = await supabase
        .from('profiles')
        .update({ wallet: newWalletAmount })
        .eq('id', selectedUserId);
      
      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === selectedUserId ? { ...user, wallet: newWalletAmount } : user
      ));
      
      toast({
        title: 'Wallet updated',
        description: `Added ${amount} credits to user's wallet.`
      });
      
      closeWalletDialog();
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was a problem updating the wallet.'
      });
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh List
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>Combined wallet balances</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {users.reduce((total, user) => total + (user.wallet || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No users found. {fetchError ? `Error: ${fetchError}` : ""}
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
                          <UserRound className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <span>{user.name || 'User'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{user.wallet}</span>
                    </div>
                  </TableCell>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsWalletDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Funds
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Wallet Funds</DialogTitle>
            <DialogDescription>
              Add credits to the user's wallet balance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="amount"
                  type="text"
                  value={walletAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    setWalletAmount(value);
                  }}
                  className="flex-1"
                />
                <span className="ml-2 text-sm text-gray-500">credits</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedUserId(null);
              setWalletAmount('100');
              setIsWalletDialogOpen(false);
            }}>Cancel</Button>
            <Button onClick={() => {
              if (selectedUserId) {
                addWalletFunds(selectedUserId, parseInt(walletAmount));
              }
            }}>Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default UserManagement;
