
import { Draw, Ticket } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendDrawEntryNotifications } from '@/utils/notificationUtils';

export const useTicketFunctions = (
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  tickets: Ticket[],
  draws: Draw[],
  setDraws: React.Dispatch<React.SetStateAction<Draw[]>>
) => {
  // Fetch tickets for the currently logged in user
  const fetchTickets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      // Transform database tickets to our application Ticket type
      const appTickets: Ticket[] = data.map(ticket => ({
        id: ticket.id,
        drawId: ticket.draw_id,
        userId: ticket.user_id,
        number: parseInt(ticket.ticket_number),
        price: ticket.price || 10, // Now the price column exists in the database
        purchaseDate: ticket.purchased_at
      }));
      
      setTickets(appTickets);
    } catch (err) {
      console.error('Unexpected error fetching tickets:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to load tickets',
        description: 'An unexpected error occurred while loading your tickets.'
      });
      throw err;
    }
  };

  // Buy a ticket with a specific number and price
  const buyTicket = async (drawId: string, ticketNumber: number, price?: number) => {
    try {
      // Find the draw to reference its details
      const draw = draws.find(d => d.id === drawId);
      if (!draw) {
        throw new Error('Draw not found');
      }

      // Use provided price or default to first available price
      const ticketPrice = price || draw.ticketPrices[0] || 10;

      // Insert the ticket into the database
      const { data: newTicket, error } = await supabase
        .from('tickets')
        .insert({
          draw_id: drawId,
          ticket_number: ticketNumber.toString(), // DB expects string
          price: ticketPrice,
          // user_id will be automatically set to auth.uid() by RLS
        })
        .select('*')
        .single();

      if (error) {
        // Check if error is due to user already having a ticket
        if (error.code === '23505' && error.message.includes('tickets_user_draw_unique')) {
          toast({
            variant: 'destructive',
            title: 'Already entered',
            description: 'You have already entered this draw with a number.'
          });
        } 
        // Check if error is due to number already taken
        else if (error.code === '23505' && error.message.includes('tickets_draw_ticket_unique')) {
          toast({
            variant: 'destructive',
            title: 'Number already taken',
            description: 'This number has already been taken. Please choose another number.'
          });
        }
        else {
          toast({
            variant: 'destructive',
            title: 'Failed to enter draw',
            description: 'An unexpected error occurred. Please try again.'
          });
        }
        throw error;
      }

      // Add the new ticket to our local state
      const appTicket: Ticket = {
        id: newTicket.id,
        drawId: newTicket.draw_id,
        userId: newTicket.user_id,
        number: parseInt(newTicket.ticket_number),
        price: newTicket.price, // Now properly available from the database
        purchaseDate: newTicket.purchased_at
      };
      
      setTickets([...tickets, appTicket]);
      
      // Update the draw's numberOfTickets count in our local state
      setDraws(draws.map(d => 
        d.id === drawId 
          ? { ...d, numberOfTickets: (d.numberOfTickets || 0) + 1 }
          : d
      ));
      
      toast({
        title: 'Entry successful',
        description: `You have entered ${draw.title} with number ${ticketNumber} for $${ticketPrice}.`,
      });

      return appTicket;
    } catch (err) {
      // Error toasts are handled above for specific cases
      console.error('Error in buyTicket:', err);
      throw err;
    }
  };

  return {
    fetchTickets,
    buyTicket
  };
};
