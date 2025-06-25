
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Draw } from '@/types';

// Helper function to transform database draw to app draw format
const transformDatabaseDrawToAppDraw = (dbDraw: any): Draw => {
  return {
    id: dbDraw.id,
    title: dbDraw.title || 'Untitled Draw',
    description: dbDraw.description || 'No description available',
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
    imageUrl: dbDraw.image_url || null,
    bannerImage: dbDraw.image_url || undefined,
    ticketPrices: dbDraw.ticket_prices || [10], // Default ticket price array
    winnerTicketNumber: dbDraw.winner_ticket_number || null,
    winnerId: dbDraw.winner_id || null
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
          description: drawData.description,
          gold_weight_grams: drawData.goldWeightGrams || drawData.goldWeight,
          draw_date: drawData.drawDate || drawData.startDate,
          status: drawData.status || 'open',
          image_url: drawData.imageUrl || drawData.bannerImage,
          ticket_prices: drawData.ticketPrices || [10] // Ensure default ticket prices
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
          description: updates.description,
          gold_weight_grams: updates.goldWeightGrams || updates.goldWeight,
          draw_date: updates.drawDate || updates.startDate,
          status: updates.status,
          image_url: updates.imageUrl || updates.bannerImage,
          ticket_prices: updates.ticketPrices
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
    // Placeholder implementation
    console.log('Pick winner for draw:', drawId);
    return {};
  };

  return {
    fetchDraws,
    createDraw,
    updateDraw,
    deleteDraw,
    pickWinner
  };
};
