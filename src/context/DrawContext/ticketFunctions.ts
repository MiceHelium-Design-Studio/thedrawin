
import { Draw, Ticket } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        price: ticket.price || 10,
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
  const buyTicket = async (drawId: string, ticketNumber: number, price?: number): Promise<Ticket> => {
    try {
      console.log('Attempting to buy ticket:', { drawId, ticketNumber, price });
      
      // Find the draw to reference its details
      const draw = draws.find(d => d.id === drawId);
      if (!draw) {
        throw new Error('Draw not found');
      }

      // Use provided price or default to first available price
      const ticketPrice = price || draw.ticketPrices[0] || 10;

      // Check if the number is already taken
      const { data: existingTicket, error: checkError } = await supabase
        .from('tickets')
        .select('ticket_number')
        .eq('draw_id', drawId)
        .eq('ticket_number', ticketNumber.toString())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing ticket:', checkError);
        throw checkError;
      }

      if (existingTicket) {
        toast({
          variant: 'destructive',
          title: 'Number already taken',
          description: `Number ${ticketNumber} has already been selected. Please choose another number.`
        });
        throw new Error('Number already taken');
      }

      // Insert the ticket into the database
      const { data: newTicket, error } = await supabase
        .from('tickets')
        .insert({
          draw_id: drawId,
          ticket_number: ticketNumber.toString(),
          price: ticketPrice,
          // user_id will be automatically set to auth.uid() by RLS
        })
        .select('*')
        .single();

      if (error) {
        console.error('Database error when inserting ticket:', error);
        
        // Handle specific constraint violations with user-friendly messages
        if (error.code === '23505') {
          if (error.message.includes('tickets_user_draw_unique')) {
            toast({
              variant: 'destructive',
              title: 'Already entered',
              description: 'You have already entered this draw. Each user can only enter once.'
            });
          } else if (error.message.includes('tickets_draw_ticket_unique')) {
            toast({
              variant: 'destructive',
              title: 'Number already taken',
              description: 'This number has already been taken. Please choose another number.'
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Entry failed',
              description: 'This entry conflicts with existing data. Please try again.'
            });
          }
        } else if (error.message.includes('Insufficient wallet balance')) {
          toast({
            variant: 'destructive',
            title: 'Insufficient balance',
            description: `You need $${ticketPrice} in your wallet to enter this draw. Please add funds to continue.`
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Failed to enter draw',
            description: 'An unexpected error occurred. Please try again.'
          });
        }
        throw error;
      }

      console.log('Ticket inserted successfully:', newTicket);

      // Add the new ticket to our local state
      const appTicket: Ticket = {
        id: newTicket.id,
        drawId: newTicket.draw_id,
        userId: newTicket.user_id,
        number: parseInt(newTicket.ticket_number),
        price: newTicket.price,
        purchaseDate: newTicket.purchased_at
      };
      
      setTickets([...tickets, appTicket]);
      
      // The draw's numberOfTickets count is automatically updated by the database trigger
      // But we should update our local state to reflect the change immediately
      setDraws(draws.map(d => 
        d.id === drawId 
          ? { ...d, numberOfTickets: (d.numberOfTickets || 0) + 1 }
          : d
      ));

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
