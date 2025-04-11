
import { supabase } from '@/integrations/supabase/client';

export const sendNotificationToUser = async (
  userId: string,
  message: string,
  type: 'system' | 'win' | 'draw' | 'promotion'
): Promise<void> => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      message,
      type
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
      'draw'
    );
    
    // Send receipt notification
    await sendNotificationToUser(
      userId,
      `Receipt: You purchased ticket #${ticketNumber} for $${ticketPrice} in "${drawTitle}"`,
      'system'
    );
  } catch (error) {
    console.error('Failed to send draw notifications:', error);
  }
};
