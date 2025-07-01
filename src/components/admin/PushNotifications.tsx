
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
        title: 'Error fetching users',
        description: 'There was a problem loading the user list.'
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
        return 'System Message';
      case 'win':
        return '🏆 Winner Announcement';
      case 'draw':
        return '🎉 Draw Update';
      case 'promotion':
        return '🎁 Promotion';
      default:
        return 'Notification';
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
          title: "Notification sent",
          description: `Sent to ${userIds.length} users`,
        });
      } else if (data.target === 'selected' && data.selectedUsers) {
        // Send to selected users with 'user' role
        const selectedEmails = data.selectedUsers.split(',').map(email => email.trim());
        const selectedUsers = users.filter(user =>
          selectedEmails.includes(user.email)
        );

        if (selectedUsers.length === 0) {
          throw new Error('No valid users found with the provided emails');
        }

        const userIds = selectedUsers.map(user => user.id);
        console.log('Sending to selected users:', userIds);

        await sendNotification(data.message, 'user', userIds);

        toast({
          title: "Notification sent",
          description: `Sent to ${userIds.length} selected users`,
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
        title: "Failed to send notification",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
      return 'Winner';
    }
    if (title?.includes('🎉') || title?.toLowerCase().includes('draw')) {
      return 'Draw';
    }
    if (title?.includes('🎁') || title?.toLowerCase().includes('promotion')) {
      return 'Promotion';
    }
    return 'System';
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Push Notifications</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Send New Notification</CardTitle>
            <CardDescription>
              Create and send push notifications to your users
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
                      <FormLabel>Notification Message</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your notification message here..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Keep it concise and clear (max 200 characters)
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
                      <FormLabel>Notification Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a notification type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="system">System Message</SelectItem>
                          <SelectItem value="win">Winner Announcement</SelectItem>
                          <SelectItem value="draw">Draw Update</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This determines how the notification will be displayed
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
                      <FormLabel>Target Audience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="selected">Selected Users</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Who should receive this notification
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
                        <FormLabel>Selected Users</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="user1@example.com, user2@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter email addresses separated by commas
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <BellRing className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              The 10 most recent notifications sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableHeader>
                <TableBody>
                  {recentNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No notifications sent yet
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
                          {notification.profiles?.name || notification.profiles?.email || 'Unknown'}
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
