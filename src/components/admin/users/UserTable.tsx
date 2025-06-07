
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]"></div>
        </div>
        <p className="text-center mt-4 text-sm text-[rgb(var(--label-secondary))]">Loading users...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full py-8">
        <div className="text-center text-[rgb(var(--destructive))]">
          <p className="font-medium">Failed to load users</p>
          <p className="text-sm mt-1">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="text-center text-[rgb(var(--label-secondary))]">
          <p>No users found</p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[rgb(var(--label-primary))]">User</TableHead>
          <TableHead className="text-[rgb(var(--label-primary))]">Email</TableHead>
          <TableHead className="text-[rgb(var(--label-primary))]">Created At</TableHead>
          <TableHead className="text-[rgb(var(--label-primary))]">Wallet</TableHead>
          <TableHead className="text-[rgb(var(--label-primary))]">Admin Status</TableHead>
          <TableHead className="text-[rgb(var(--label-primary))]">Actions</TableHead>
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
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--secondary-system-background))] flex items-center justify-center">
                    <UserRound className="w-4 h-4 text-[rgb(var(--label-tertiary))]" />
                  </div>
                )}
                <span className="text-[rgb(var(--label-primary))]">{user.name || 'User'}</span>
              </div>
            </TableCell>
            <TableCell className="text-[rgb(var(--label-primary))]">{user.email}</TableCell>
            <TableCell className="text-[rgb(var(--label-primary))]">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[rgb(var(--primary))]" />
                <span className="font-medium text-[rgb(var(--label-primary))]">{user.wallet}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={user.isAdmin} 
                  onCheckedChange={() => onToggleAdmin(user.id, user.isAdmin || false)}
                />
                <span className={user.isAdmin ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--label-tertiary))]'}>
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
                  className="text-[rgb(var(--label-primary))]"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Notify
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddFunds(user.id)}
                  className="text-[rgb(var(--label-primary))]"
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
