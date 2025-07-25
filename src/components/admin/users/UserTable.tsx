
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]"></div>
        </div>
        <p className="text-center mt-4 text-sm text-white">{t('admin.users.loadingUsers')}</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full py-8">
        <div className="text-center text-[rgb(var(--destructive))]">
          <p className="font-medium text-[#FF4C4C]">{t('admin.users.failedToLoadUsers')}</p>
          <p className="text-sm mt-1 text-[#FF4C4C]">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <p className="text-white">{t('admin.users.noUsersFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('admin.users.user')}</TableHead>
          <TableHead>{t('admin.users.email')}</TableHead>
          <TableHead>{t('admin.users.createdAt')}</TableHead>
          <TableHead>{t('admin.users.wallet')}</TableHead>
          <TableHead>{t('admin.users.adminStatus')}</TableHead>
          <TableHead>{t('admin.users.actions')}</TableHead>
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
                    <UserRound className="w-4 h-4 text-white" />
                  </div>
                )}
                <span>{user.name || t('admin.users.user')}</span>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#F39C0A]" />
                <span className="font-medium">{user.wallet}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch
                  className="border-[#F39C0A] [&>span]:bg-[#F39C0A] focus-visible:ring-[#F39C0A]"
                  checked={user.isAdmin}
                  onCheckedChange={() => onToggleAdmin(user.id, user.isAdmin || false)}
                />
                <span className={user.isAdmin ? 'text-[#F39C0A]' : 'text-white'}>
                  {user.isAdmin ? t('admin.users.admin') : t('admin.users.regularUser')}
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
                  <span>{t('admin.users.notify')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddFunds(user.id)}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  <span>{t('admin.users.addFunds')}</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
