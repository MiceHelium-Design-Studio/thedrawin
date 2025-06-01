
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
        description: 'Win amazing prizes in our lottery draw',
        maxParticipants: 100,
        currentParticipants: 0,
        ticketPrices: [10], // Default price
        status: draw.status as 'upcoming' | 'active' | 'completed',
        startDate: draw.created_at,
        endDate: draw.draw_date || new Date().toISOString(),
        winner: draw.winner_id ? 'Winner Announced' : undefined,
        numberOfTickets: draw.number_of_tickets,
        bannerImage: '/lovable-uploads/banner.png' // Default banner
      }));
      
      setDraws(appDraws);
    } catch (err) {
      console.error('Unexpected error fetching draws:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to load draws',
        description: 'An unexpected error occurred while loading the draws.'
      });
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
          draw_date: draw.endDate
        })
        .select('*')
        .single();

      if (error) throw error;
      
      // Convert the database draw back to our app Draw type
      const appDraw: Draw = {
        id: newDraw.id,
        title: newDraw.title || 'Untitled Draw',
        description: draw.description || 'Win amazing prizes in our lottery draw',
        maxParticipants: draw.maxParticipants || 100,
        currentParticipants: 0,
        ticketPrices: draw.ticketPrices || [10],
        status: newDraw.status as 'upcoming' | 'active' | 'completed',
        startDate: newDraw.created_at,
        endDate: newDraw.draw_date || new Date().toISOString(),
        numberOfTickets: 0,
        bannerImage: draw.bannerImage || '/lovable-uploads/banner.png'
      };

      setDraws([...draws, appDraw]);
      
      toast({
        title: 'Draw created',
        description: `${draw.title} has been created successfully.`
      });
      
      return appDraw;
    } catch (err) {
      console.error('Unexpected error creating draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to create draw',
        description: 'An unexpected error occurred while creating the draw.'
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
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.endDate) dbUpdates.draw_date = updates.endDate;
      
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
    } catch (err) {
      console.error('Unexpected error updating draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to update draw',
        description: 'An unexpected error occurred while updating the draw.'
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
    } catch (err) {
      console.error('Unexpected error deleting draw:', err);
      toast({
        variant: 'destructive',
        title: 'Failed to delete draw',
        description: 'An unexpected error occurred while deleting the draw.'
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
      
      // Update local state with the winner
      setDraws(draws.map(draw => {
        if (draw.id === drawId) {
          return {
            ...draw,
            status: 'completed',
            winner: winnerData.winner_name || 'Unknown',
          };
        }
        return draw;
      }));

      toast({
        title: 'Winner selected!',
        description: `A winner has been chosen for the draw: ${winnerData.winner_name}`
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
