
import React from 'react';
import { Mail, PlusCircle, UserRound, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from '@/types';

interface UserTableProps {
  users: User[];
  loading: boolean;
  fetchError: string | null;
  onToggleAdmin: (userId: string, currentStatus: boolean) => Promise<void>;
  onSendNotification: (userId: string, email: string) => Promise<void>;
  onAddFunds: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  fetchError,
  onToggleAdmin,
  onSendNotification,
  onAddFunds,
}) => {
  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <p className="text-center mt-4 text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full py-8">
        <div className="text-center text-red-500">
          <p className="font-medium">Failed to load users</p>
          <p className="text-sm mt-1">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="text-center text-muted-foreground">
          <p>No users found</p>
        </div>
      </div>
    );
  }

  return (
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
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {user.avatar_url || user.avatar ? (
                  <img 
                    src={user.avatar_url || user.avatar} 
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
                  onCheckedChange={() => onToggleAdmin(user.id, user.isAdmin || false)}
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
                  onClick={() => onSendNotification(user.id, user.email)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Notify
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddFunds(user.id)}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Funds
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
