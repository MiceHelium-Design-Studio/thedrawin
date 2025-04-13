
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../types';

export const sendNotificationToUser = async (
  userId: string,
  message: string,
  type: 'system' | 'win' | 'draw' | 'promotion'
): Promise<Notification | null> => {
  try {
    console.log(`Sending notification to user ${userId}: ${message} (${type})`);
    
    // Try to send to Supabase
    const { data, error } = await supabase.from('notifications').insert({
      user_id: userId,
      message,
      type
    }).select('*').single();
    
    if (error) {
      console.error('Supabase notification error:', error);
      
      // If Supabase fails, create a local notification object
      const localNotification: Notification = {
        id: uuidv4(),
        userId,
        message,
        read: false,
        type,
        createdAt: new Date().toISOString()
      };
      
      console.log('Created local notification:', localNotification);
      return localNotification;
    }
    
    console.log('Successfully sent notification to Supabase:', data);
    
    return {
      id: data.id,
      userId: data.user_id,
      message: data.message,
      read: data.read,
      type: data.type as 'system' | 'win' | 'draw' | 'promotion',
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Failed to send notification:', error);
    
    // Return a local notification object
    const localNotification: Notification = {
      id: uuidv4(),
      userId,
      message,
      read: false,
      type,
      createdAt: new Date().toISOString()
    };
    
    console.log('Created local notification after error:', localNotification);
    return localNotification;
  }
};

export const sendDrawEntryNotifications = async (
  userId: string,
  drawTitle: string,
  ticketNumber: number,
  ticketPrice: number
): Promise<Notification[]> => {
  try {
    const notifications: Notification[] = [];
    
    // Send entry notification
    const entryNotification = await sendNotificationToUser(
      userId,
      `You've successfully entered the "${drawTitle}" draw!`,
      'draw'
    );
    
    if (entryNotification) {
      notifications.push(entryNotification);
    }
    
    // Send receipt notification
    const receiptNotification = await sendNotificationToUser(
      userId,
      `Receipt: You purchased ticket #${ticketNumber} for $${ticketPrice} in "${drawTitle}"`,
      'system'
    );
    
    if (receiptNotification) {
      notifications.push(receiptNotification);
    }
    
    console.log('Created draw entry notifications:', notifications);
    return notifications;
  } catch (error) {
    console.error('Failed to send draw notifications:', error);
    return [];
  }
};
