
import { Draw, Ticket } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useTicketFunctions = (
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  tickets: Ticket[],
  draws: Draw[],
  setDraws: React.Dispatch<React.SetStateAction<Draw[]>>
) => {
  // Mock function for fetching tickets since table doesn't exist in DB yet
  const fetchTickets = async (userId: string) => {
    try {
      // For development, we'll use a mock response until the tickets table is created
      setTickets([
        {
          id: '1',
          drawId: '1',
          userId: userId,
          number: 12345,
          price: 10,
          purchaseDate: new Date().toISOString()
        }
      ]);
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

  // Updated buyTicket function to accept a specific ticket number and update ticket count
  const buyTicket = async (drawId: string, ticketNumber: number) => {
    try {
      // Mock buy ticket functionality
      const draw = draws.find(d => d.id === drawId);
      if (!draw) {
        throw new Error('Draw not found');
      }

      const ticketPrice = draw.ticketPrices[0]; // Assuming the first price in the array
      
      // Generate a single ticket with the specified number
      const newTicket = {
        id: Math.random().toString(),
        drawId: drawId,
        userId: 'mock-user-id', // This will be replaced with the actual user ID
        number: ticketNumber,
        price: ticketPrice,
        purchaseDate: new Date().toISOString()
      };
      
      setTickets([...tickets, newTicket]);
      
      // Update the draw's numberOfTickets count
      setDraws(draws.map(d => 
        d.id === drawId 
          ? { ...d, numberOfTickets: (d.numberOfTickets || 0) + 1 }
          : d
      ));
      
      toast({
        title: 'Entry successful',
        description: `You have entered ${draw.title} with number ${ticketNumber}.`,
      });
    } catch (err) {
      console.error('Unexpected error buying ticket:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to enter draw',
        description: 'An unexpected error occurred while entering the draw.'
      });
      throw err;
    }
  };

  return {
    fetchTickets,
    buyTicket
  };
};
