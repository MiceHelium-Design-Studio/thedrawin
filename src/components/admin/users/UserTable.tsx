
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
        <p className="text-center mt-4 text-sm" style={{ color: '#FFFFFF' }}>Loading users...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full py-8">
        <div className="text-center text-[rgb(var(--destructive))]">
          <p className="font-medium" style={{ color: '#FF4C4C' }}>Failed to load users</p>
          <p className="text-sm mt-1" style={{ color: '#FF4C4C' }}>{fetchError}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <p style={{ color: '#FFFFFF' }}>No users found</p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ color: '#FFFFFF' }}>User</TableHead>
          <TableHead style={{ color: '#FFFFFF' }}>Email</TableHead>
          <TableHead style={{ color: '#FFFFFF' }}>Created At</TableHead>
          <TableHead style={{ color: '#FFFFFF' }}>Wallet</TableHead>
          <TableHead style={{ color: '#FFFFFF' }}>Admin Status</TableHead>
          <TableHead style={{ color: '#FFFFFF' }}>Actions</TableHead>
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
                    <UserRound className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                  </div>
                )}
                <span style={{ color: '#FFFFFF' }}>{user.name || 'User'}</span>
              </div>
            </TableCell>
            <TableCell style={{ color: '#FFFFFF' }}>{user.email}</TableCell>
            <TableCell style={{ color: '#FFFFFF' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" style={{ color: '#F39C0A' }} />
                <span className="font-medium" style={{ color: '#FFFFFF' }}>{user.wallet}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={user.isAdmin} 
                  onCheckedChange={() => onToggleAdmin(user.id, user.isAdmin || false)}
                />
                <span style={{ color: user.isAdmin ? '#F39C0A' : '#FFFFFF' }}>
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
                  style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}
                >
                  <Mail className="h-4 w-4 mr-1" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Notify</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddFunds(user.id)}
                  style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}
                >
                  <PlusCircle className="h-4 w-4 mr-1" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Add Funds</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
