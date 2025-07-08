
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/context/NotificationContext';
import { BellRing, Users, User, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

// Notification Form Schema
const notificationFormSchema = z.object({
  message: z.string().min(5, {
    message: "Message must be at least 5 characters",
  }).max(200, {
    message: "Message must be less than 200 characters",
  }),
  type: z.enum(['system', 'win', 'draw', 'promotion'], {
    required_error: "Please select a notification type",
  }),
  target: z.enum(['all', 'selected'], {
    required_error: "Please select a target audience",
  }),
  selectedUsers: z.string().optional(),
});

interface Profile {
  id: string;
  email: string;
  name?: string;
}

const PushNotifications: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { sendNotification } = useNotifications();
  const [users, setUsers] = useState<Profile[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Initialize notification form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      message: "",
      type: "system",
      target: "all",
      selectedUsers: "",
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchRecentNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching users for admin notifications...');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: t('admin.pushNotifications.errorFetchingUsers'),
        description: t('admin.pushNotifications.errorLoadingUserList')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      console.log('Fetching recent notifications...');

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, 
          message, 
          title, 
          created_at,
          profiles:user_id (email, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent notifications:', error);
        throw error;
      }

      console.log('Fetched recent notifications:', data);
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      // Don't show error toast for this as it's not critical
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'system':
        return t('admin.pushNotifications.systemMessage');
      case 'win':
        return '🏆 ' + t('admin.pushNotifications.winnerAnnouncement');
      case 'draw':
        return '🎉 ' + t('admin.pushNotifications.drawUpdate');
      case 'promotion':
        return '🎁 ' + t('admin.pushNotifications.promotion');
      default:
        return t('admin.pushNotifications.notification');
    }
  };

  const onNotificationSubmit = async (data: z.infer<typeof notificationFormSchema>) => {
    try {
      setIsSending(true);
      console.log('Submitting notification:', data);

      const notificationTitle = getNotificationTitle(data.type);

      if (data.target === 'all') {
        // Send to all users with 'user' role
        const userIds = users.map(user => user.id);
        console.log('Sending to all users:', userIds.length);

        await sendNotification(data.message, 'user', userIds);

        toast({
          title: t('admin.pushNotifications.notificationSent'),
          description: t('admin.pushNotifications.sentToUsers', { count: userIds.length }),
        });
      } else if (data.target === 'selected' && data.selectedUsers) {
        // Send to selected users with 'user' role
        const selectedEmails = data.selectedUsers.split(',').map(email => email.trim());
        const selectedUsers = users.filter(user =>
          selectedEmails.includes(user.email)
        );

        if (selectedUsers.length === 0) {
          throw new Error(t('admin.pushNotifications.noValidUsersFound'));
        }

        const userIds = selectedUsers.map(user => user.id);
        console.log('Sending to selected users:', userIds);

        await sendNotification(data.message, 'user', userIds);

        toast({
          title: t('admin.pushNotifications.notificationSent'),
          description: t('admin.pushNotifications.sentToSelectedUsers', { count: userIds.length }),
        });
      }

      // Reset form
      notificationForm.reset({
        message: "",
        type: "system",
        target: "all",
        selectedUsers: "",
      });

      // Refresh notifications list
      fetchRecentNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: t('admin.pushNotifications.failedToSendNotification'),
        description: error instanceof Error ? error.message : t('admin.pushNotifications.unknownError'),
      });
    } finally {
      setIsSending(false);
    }
  };

  const getNotificationTypeIcon = (title: string) => {
    if (title?.includes('🏆') || title?.toLowerCase().includes('winner')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (title?.includes('🎉') || title?.toLowerCase().includes('draw')) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
    if (title?.includes('🎁') || title?.toLowerCase().includes('promotion')) {
      return <BellRing className="h-4 w-4 text-purple-500" />;
    }
    return <BellRing className="h-4 w-4 text-blue-500" />;
  };

  const getNotificationTypeLabel = (title: string) => {
    if (title?.includes('🏆') || title?.toLowerCase().includes('winner')) {
      return t('admin.pushNotifications.winner');
    }
    if (title?.includes('🎉') || title?.toLowerCase().includes('draw')) {
      return t('admin.pushNotifications.draw');
    }
    if (title?.includes('🎁') || title?.toLowerCase().includes('promotion')) {
      return t('admin.pushNotifications.promotionLabel');
    }
    return t('admin.pushNotifications.system');
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">{t('admin.pushNotifications.title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.pushNotifications.sendNewNotification')}</CardTitle>
            <CardDescription>
              {t('admin.pushNotifications.createAndSendNotifications')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                <FormField
                  control={notificationForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.pushNotifications.notificationMessage')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('admin.pushNotifications.enterNotificationMessage')} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('admin.pushNotifications.keepConciseAndClear')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.pushNotifications.notificationType')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.pushNotifications.selectNotificationType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="system">{t('admin.pushNotifications.systemMessage')}</SelectItem>
                          <SelectItem value="win">{t('admin.pushNotifications.winnerAnnouncement')}</SelectItem>
                          <SelectItem value="draw">{t('admin.pushNotifications.drawUpdate')}</SelectItem>
                          <SelectItem value="promotion">{t('admin.pushNotifications.promotion')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t('admin.pushNotifications.notificationDisplayDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationForm.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.pushNotifications.targetAudience')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.pushNotifications.selectTargetAudience')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">{t('admin.pushNotifications.allUsers')}</SelectItem>
                          <SelectItem value="selected">{t('admin.pushNotifications.selectedUsers')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t('admin.pushNotifications.whoShouldReceive')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {notificationForm.watch('target') === 'selected' && (
                  <FormField
                    control={notificationForm.control}
                    name="selectedUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.pushNotifications.selectedUsers')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('admin.pushNotifications.emailPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('admin.pushNotifications.enterEmailsSeparated')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('admin.pushNotifications.sending')}
                    </>
                  ) : (
                    <>
                      <BellRing className="h-4 w-4 mr-2" />
                      {t('admin.pushNotifications.sendNotification')}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.pushNotifications.recentNotifications')}</CardTitle>
            <CardDescription>
              {t('admin.pushNotifications.recentNotificationsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHead>{t('admin.pushNotifications.type')}</TableHead>
                  <TableHead>{t('admin.pushNotifications.message')}</TableHead>
                  <TableHead>{t('admin.pushNotifications.recipient')}</TableHead>
                  <TableHead>{t('admin.pushNotifications.sentAt')}</TableHead>
                </TableHeader>
                <TableBody>
                  {recentNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        {t('admin.pushNotifications.noNotificationsSentYet')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getNotificationTypeIcon(notification.title)}
                            <span className="ml-2">{getNotificationTypeLabel(notification.title)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {notification.message}
                        </TableCell>
                        <TableCell>
                          {notification.profiles?.name || notification.profiles?.email || t('admin.pushNotifications.unknown')}
                        </TableCell>
                        <TableCell>
                          {new Date(notification.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PushNotifications;
