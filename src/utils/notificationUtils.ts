
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const sendNotificationToUser = async (
  userId: string,
  message: string,
  role: 'admin' | 'user' = 'user',
  title: string = 'Notification'
): Promise<void> => {
  try {
    // Insert the notification into the database
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      message,
      role,
      title
    });
    
    if (error) throw error;
    
    // For real-time feedback, also show a toast notification
    toast({
      title: title,
      description: message,
      duration: 5000
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};

export const sendDrawEntryNotifications = async (
  userId: string,
  drawTitle: string,
  ticketNumber: number,
  ticketPrice: number
): Promise<void> => {
  try {
    // Send entry notification
    await sendNotificationToUser(
      userId,
      `You've successfully entered the "${drawTitle}" draw!`,
      'user',
      '🎉 Ticket Purchased'
    );
    
    // Send receipt notification
    await sendNotificationToUser(
      userId,
      `Receipt: You purchased ticket #${ticketNumber} for $${ticketPrice} in "${drawTitle}"`,
      'user',
      'Purchase Receipt'
    );
  } catch (error) {
    console.error('Failed to send draw notifications:', error);
    // Show error toast for user feedback even if the database notification fails
    toast({
      variant: 'destructive',
      title: 'Notification Error',
      description: 'Failed to send draw entry notifications, but your ticket was purchased successfully.',
    });
  }
};
