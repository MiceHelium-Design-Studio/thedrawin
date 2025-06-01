
import { Draw } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMockDrawFunctions = (
  setDraws: React.Dispatch<React.SetStateAction<Draw[]>>, 
  draws: Draw[]
) => {
  // Fetch draws from the database
  const fetchDraws = async () => {
    try {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the database draws to our application Draw type
      const appDraws: Draw[] = data.map(draw => ({
        id: draw.id,
        title: draw.title || 'Untitled Draw',
        description: `Win ${draw.gold_weight_grams}g of gold in this exciting draw!`,
        maxParticipants: 100,
        currentParticipants: draw.number_of_tickets || 0,
        ticketPrices: [10, 25, 50], // Default prices
        status: draw.status === 'open' ? 'active' : draw.status as 'upcoming' | 'active' | 'completed',
        startDate: draw.created_at,
        endDate: draw.draw_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        winner: draw.winner_id ? 'Winner Announced' : undefined,
        numberOfTickets: draw.number_of_tickets || 0,
        bannerImage: '/lovable-uploads/banner.png',
        goldWeight: draw.gold_weight_grams
      }));
      
      console.log('Fetched draws from database:', appDraws.length, 'draws');
      setDraws(appDraws);
    } catch (err: any) {
      console.error('Error fetching draws:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('relation "draws" does not exist')) {
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'The draws table does not exist. Please contact support.'
        });
      } else if (err.message?.includes('permission denied')) {
        toast({
          variant: 'destructive',
          title: 'Permission Error',
          description: 'You do not have permission to access draws.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to load draws',
          description: 'There was an error loading the draws. Please try refreshing the page.'
        });
      }
      
      // Set empty array as fallback to prevent crashes
      setDraws([]);
      throw err;
    }
  };

  // Create a new draw
  const createDraw = async (draw: Omit<Draw, 'id'>) => {
    try {
      // Convert the app draw to the database schema
      const { data: newDraw, error } = await supabase
        .from('draws')
        .insert({
          title: draw.title,
          status: 'open',
          number_of_tickets: 0,
          draw_date: draw.endDate,
          gold_weight_grams: draw.goldWeight || 5.0
        })
        .select('*')
        .single();

      if (error) throw error;
      
      // Convert the database draw back to our app Draw type
      const appDraw: Draw = {
        id: newDraw.id,
        title: newDraw.title || 'Untitled Draw',
        description: draw.description || `Win ${newDraw.gold_weight_grams}g of gold in this exciting draw!`,
        maxParticipants: draw.maxParticipants || 100,
        currentParticipants: 0,
        ticketPrices: draw.ticketPrices || [10, 25, 50],
        status: 'active',
        startDate: newDraw.created_at,
        endDate: newDraw.draw_date || new Date().toISOString(),
        numberOfTickets: 0,
        bannerImage: draw.bannerImage || '/lovable-uploads/banner.png',
        goldWeight: newDraw.gold_weight_grams
      };

      setDraws([appDraw, ...draws]);
      
      toast({
        title: 'Draw created',
        description: `${draw.title} has been created successfully.`
      });
      
      return appDraw;
    } catch (err: any) {
      console.error('Error creating draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to create draw',
        description: err.message || 'An unexpected error occurred while creating the draw.'
      });
      throw err;
    }
  };

  // Update an existing draw
  const updateDraw = async (id: string, updates: Partial<Draw>) => {
    try {
      // Convert the app updates to the database schema
      const dbUpdates: any = {};
      
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.status) {
        dbUpdates.status = updates.status === 'active' ? 'open' : updates.status;
      }
      if (updates.endDate) dbUpdates.draw_date = updates.endDate;
      if (updates.goldWeight) dbUpdates.gold_weight_grams = updates.goldWeight;
      
      const { error } = await supabase
        .from('draws')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setDraws(draws.map(draw => (draw.id === id ? { ...draw, ...updates } : draw)));
      
      toast({
        title: 'Draw updated',
        description: `${updates.title || 'Draw'} has been updated successfully.`
      });
    } catch (err: any) {
      console.error('Error updating draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to update draw',
        description: err.message || 'An unexpected error occurred while updating the draw.'
      });
      throw err;
    }
  };

  // Delete a draw
  const deleteDraw = async (id: string) => {
    try {
      const { error } = await supabase
        .from('draws')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setDraws(draws.filter(draw => draw.id !== id));
      
      toast({
        title: 'Draw deleted',
        description: 'The draw has been deleted successfully.'
      });
    } catch (err: any) {
      console.error('Error deleting draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to delete draw',
        description: err.message || 'An unexpected error occurred while deleting the draw.'
      });
      throw err;
    }
  };

  // Pick a winner for a draw
  const pickWinner = async (drawId: string) => {
    try {
      const { data: winnerData, error } = await supabase
        .rpc('pick_draw_winner', { draw_uuid: drawId });
      
      if (error) {
        throw error;
      }
      
      // Handle the winner data properly, checking if it's an object with the expected properties
      let winnerName = 'Unknown';
      if (winnerData && typeof winnerData === 'object') {
        const winner = winnerData as Record<string, any>;
        winnerName = winner.winner_name || 'Unknown';
      }
      
      // Update local state with the winner
      setDraws(draws.map(draw => {
        if (draw.id === drawId) {
          return {
            ...draw,
            status: 'completed' as const,
            winner: winnerName,
          };
        }
        return draw;
      }));

      toast({
        title: 'Winner selected!',
        description: `A winner has been chosen for the draw: ${winnerName}`
      });

      return winnerData;
    } catch (err: any) {
      console.error('Error picking winner:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to pick winner',
        description: err.message || 'An unexpected error occurred.'
      });
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
