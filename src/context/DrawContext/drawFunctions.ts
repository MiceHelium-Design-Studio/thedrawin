import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Draw } from '@/types';

// Helper function to transform database draw to app draw format
const transformDatabaseDrawToAppDraw = (dbDraw: {
  id: string;
  title: string | null;
  gold_weight_grams: number | null;
  number_of_tickets: number;
  draw_date: string | null;
  status: string | null;
  created_at: string | null;
  winner_ticket_number: number | null;
  winner_id: string | null;
}): Draw => {
  return {
    id: dbDraw.id,
    title: dbDraw.title || 'Untitled Draw',
    description: 'No description available', // Default description since DB doesn't have this column
    goldWeightGrams: dbDraw.gold_weight_grams || 0,
    goldWeight: dbDraw.gold_weight_grams || 0, // Map to both fields for compatibility
    numberOfTickets: dbDraw.number_of_tickets || 0,
    maxParticipants: dbDraw.number_of_tickets || 0,
    currentParticipants: 0, // This would need to be calculated from tickets table
    drawDate: dbDraw.draw_date,
    startDate: dbDraw.draw_date || '',
    endDate: dbDraw.draw_date || '',
    status: dbDraw.status || 'open',
    createdAt: dbDraw.created_at,
    imageUrl: null, // Database doesn't have image_url column
    bannerImage: undefined, // Database doesn't have image_url column
    ticketPrices: [5, 10, 15, 20, 30], // Default ticket prices since DB doesn't store this
    winnerTicketNumber: dbDraw.winner_ticket_number || null,
    winnerId: dbDraw.winner_id || null,
    winner: null // Support for pre-calculated winner names
  };
};

export const useDrawFunctions = (
  setDraws: React.Dispatch<React.SetStateAction<Draw[]>>,
  draws: Draw[]
) => {
  const fetchDraws = async () => {
    try {
      console.log('Fetching draws from database...');
      
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching draws:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load draws',
          description: 'There was an error loading the draws. Please try again later.'
        });
        throw error;
      }

      console.log('Raw draw data from database:', data);
      
      // Transform the database data to match our app's expected format
      const transformedDraws = (data || []).map(transformDatabaseDrawToAppDraw);
      
      console.log('Transformed draws for app:', transformedDraws);
      setDraws(transformedDraws);
      
      return transformedDraws;
    } catch (err) {
      console.error('Unexpected error fetching draws:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to load draws',
        description: 'An unexpected error occurred while loading draws.'
      });
      throw err;
    }
  };

  const createDraw = async (drawData: Partial<Draw>) => {
    try {
      console.log('Creating new draw:', drawData);
      
      const { data, error } = await supabase
        .from('draws')
        .insert({
          title: drawData.title,
          gold_weight_grams: drawData.goldWeightGrams || drawData.goldWeight,
          draw_date: drawData.drawDate || drawData.startDate,
          status: drawData.status || 'open',
          number_of_tickets: drawData.maxParticipants || 100
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating draw:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to create draw',
          description: 'There was an error creating the draw. Please try again.'
        });
        throw error;
      }

      console.log('Successfully created draw:', data);
      
      // Transform and add to local state
      const newDraw = transformDatabaseDrawToAppDraw(data);
      setDraws(prev => [newDraw, ...prev]);
      
      toast({
        title: 'Draw created successfully',
        description: `"${drawData.title}" has been created.`
      });
      
      return newDraw;
    } catch (err) {
      console.error('Unexpected error creating draw:', err);
      throw err;
    }
  };

  const updateDraw = async (id: string, updates: Partial<Draw>) => {
    try {
      console.log('Updating draw:', id, updates);
      
      const { data, error } = await supabase
        .from('draws')
        .update({
          title: updates.title,
          gold_weight_grams: updates.goldWeightGrams || updates.goldWeight,
          draw_date: updates.drawDate || updates.startDate,
          status: updates.status,
          number_of_tickets: updates.maxParticipants
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating draw:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to update draw',
          description: 'There was an error updating the draw. Please try again.'
        });
        throw error;
      }

      // Transform and update local state
      const updatedDraw = transformDatabaseDrawToAppDraw(data);
      setDraws(prev => prev.map(draw => draw.id === id ? updatedDraw : draw));
      
      toast({
        title: 'Draw updated successfully',
        description: `"${updates.title || updatedDraw.title}" has been updated.`
      });
      
      return updatedDraw;
    } catch (err) {
      console.error('Unexpected error updating draw:', err);
      throw err;
    }
  };

  const deleteDraw = async (id: string) => {
    try {
      console.log('Deleting draw:', id);
      
      const { error } = await supabase
        .from('draws')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting draw:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to delete draw',
          description: 'There was an error deleting the draw. Please try again.'
        });
        throw error;
      }

      // Remove from local state
      setDraws(prev => prev.filter(draw => draw.id !== id));
      
      toast({
        title: 'Draw deleted successfully',
        description: 'The draw has been removed.'
      });
    } catch (err) {
      console.error('Unexpected error deleting draw:', err);
      throw err;
    }
  };

  const pickWinner = async (drawId: string) => {
    try {
      console.log('Picking winner for draw:', drawId);
      
      // First, get all tickets for this draw
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('draw_id', drawId);

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        toast({
          variant: 'destructive',
          title: 'Failed to pick winner',
          description: 'Could not fetch tickets for this draw.'
        });
        throw ticketsError;
      }

      if (!tickets || tickets.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No participants',
          description: 'Cannot pick a winner for a draw with no participants.'
        });
        throw new Error('No tickets found for this draw');
      }

      // Randomly select a winning ticket
      const randomIndex = Math.floor(Math.random() * tickets.length);
      const winningTicket = tickets[randomIndex];
      
      console.log('Selected winning ticket:', winningTicket);

      // Get winner profile information
      const { data: winnerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', winningTicket.user_id)
        .single();

      // Create winner name (fallback to email username if names not available)
      let winnerName = 'Anonymous Winner';
      if (!profileError && winnerProfile) {
        if (winnerProfile.first_name && winnerProfile.last_name) {
          winnerName = `${winnerProfile.first_name} ${winnerProfile.last_name}`;
        } else if (winnerProfile.email) {
          winnerName = winnerProfile.email.split('@')[0];
        }
      }

      // Update the draw with winner information
      const { data: updatedDraw, error: updateError } = await supabase
        .from('draws')
        .update({
          winner_id: winningTicket.user_id,
          winner_ticket_number: parseInt(winningTicket.ticket_number),
          status: 'completed'
        })
        .eq('id', drawId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating draw with winner:', updateError);
        toast({
          variant: 'destructive',
          title: 'Failed to update draw',
          description: 'Could not save winner information.'
        });
        throw updateError;
      }

      console.log('Draw updated with winner:', updatedDraw);

      // Transform and update local state
      const transformedDraw = transformDatabaseDrawToAppDraw({
        ...updatedDraw,
        winner: winnerName // Add the winner name for display
      });
      
      setDraws(prev => prev.map(draw => 
        draw.id === drawId ? transformedDraw : draw
      ));

      // Send notification to the winner
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: winningTicket.user_id,
            title: 'Congratulations! You Won!',
            message: `You are the winner of "${transformedDraw.title}"! Your winning number was ${winningTicket.ticket_number}.`,
            role: 'user'
          });
      } catch (notificationError) {
        console.error('Error sending winner notification:', notificationError);
        // Don't throw here, as the main winner selection was successful
      }

      // Send notification to all other participants
      try {
        const otherParticipants = tickets.filter(t => t.user_id !== winningTicket.user_id);
        
        if (otherParticipants.length > 0) {
          const otherNotifications = otherParticipants.map(ticket => ({
            user_id: ticket.user_id,
            title: 'Draw Results',
            message: `The draw "${transformedDraw.title}" has ended. Winner: ${winnerName} with number ${winningTicket.ticket_number}. Better luck next time!`,
            role: 'user' as const
          }));

          await supabase
            .from('notifications')
            .insert(otherNotifications);
        }
      } catch (notificationError) {
        console.error('Error sending participant notifications:', notificationError);
        // Don't throw here, as the main winner selection was successful
      }

      toast({
        title: 'Winner selected successfully!',
        description: `${winnerName} won with ticket number ${winningTicket.ticket_number}`,
      });

      return {
        winner: winnerName,
        winningTicket: winningTicket.ticket_number,
        winnerId: winningTicket.user_id,
        draw: transformedDraw
      };
    } catch (err) {
      console.error('Unexpected error picking winner:', err);
      throw err;
    }
  };

  return {
    fetchDraws,
    createDraw,
    updateDraw,
    deleteDraw,
    pickWinner
  };
};
