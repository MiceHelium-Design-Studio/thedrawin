import { Draw } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a draw should automatically have a winner selected
 */
export const shouldAutoSelectWinner = (draw: Draw): boolean => {
  if (draw.status === 'completed' || draw.winner) {
    return false; // Already has a winner
  }

  if (!draw.endDate) {
    return false; // No end date specified
  }

  const endDate = new Date(draw.endDate);
  const now = new Date();
  
  // Check if draw has ended and has participants
  return endDate < now && 
         (draw.status === 'active' || draw.status === 'open') &&
         draw.numberOfTickets && 
         draw.numberOfTickets > 0;
};

/**
 * Get draws that are eligible for automatic winner selection
 */
export const getDrawsEligibleForWinnerSelection = (draws: Draw[]): Draw[] => {
  return draws.filter(shouldAutoSelectWinner);
};

/**
 * Check if a draw has sufficient participants for winner selection
 */
export const hasMinimumParticipants = (draw: Draw, minimumParticipants: number = 1): boolean => {
  return (draw.numberOfTickets || 0) >= minimumParticipants;
};

/**
 * Get draw participation statistics
 */
export const getDrawStats = (draw: Draw) => {
  const totalTickets = draw.numberOfTickets || 0;
  const maxParticipants = draw.maxParticipants || 100;
  const participationRate = maxParticipants > 0 ? (totalTickets / maxParticipants) * 100 : 0;
  
  return {
    totalTickets,
    maxParticipants,
    participationRate: Math.round(participationRate),
    spotsRemaining: Math.max(0, maxParticipants - totalTickets),
    isFull: totalTickets >= maxParticipants
  };
};

/**
 * Check if a user can enter a draw
 */
export const canUserEnterDraw = (draw: Draw, userBalance: number): { canEnter: boolean; reason?: string } => {
  if (draw.status === 'completed') {
    return { canEnter: false, reason: 'Draw has ended' };
  }
  
  if (draw.status === 'upcoming') {
    return { canEnter: false, reason: 'Draw has not started yet' };
  }
  
  if (draw.status !== 'active' && draw.status !== 'open') {
    return { canEnter: false, reason: 'Draw is not accepting entries' };
  }
  
  const stats = getDrawStats(draw);
  if (stats.isFull) {
    return { canEnter: false, reason: 'Draw is full' };
  }
  
  const minPrice = Math.min(...draw.ticketPrices);
  if (userBalance < minPrice) {
    return { canEnter: false, reason: `Insufficient funds (need at least $${minPrice})` };
  }
  
  return { canEnter: true };
};

/**
 * Format draw status for display
 */
export const getDrawStatusDisplay = (draw: Draw): { text: string; color: string; icon: string } => {
  switch (draw.status) {
    case 'upcoming':
      return { text: 'Coming Soon', color: 'yellow', icon: '⏰' };
    case 'active':
    case 'open':
      return { text: 'Open for Entry', color: 'green', icon: '🎯' };
    case 'completed':
      return { text: draw.winner ? 'Winner Selected' : 'Completed', color: 'blue', icon: '🏆' };
    default:
      return { text: 'Unknown', color: 'gray', icon: '❓' };
  }
};

/**
 * Get time remaining for a draw
 */
export const getTimeRemaining = (endDate: string): { isExpired: boolean; timeLeft: string } => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { isExpired: true, timeLeft: 'Expired' };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { isExpired: false, timeLeft: `${days}d ${hours}h` };
  } else if (hours > 0) {
    return { isExpired: false, timeLeft: `${hours}h ${minutes}m` };
  } else {
    return { isExpired: false, timeLeft: `${minutes}m` };
  }
}; 