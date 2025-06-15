
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Award, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Draw } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useDraws } from '@/context/DrawContext/index';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import SelectNumberModal from './draw-detail/SelectNumberModal';

interface DrawCardProps {
  draw: Draw;
}

const DrawCard: React.FC<DrawCardProps> = ({ draw }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pickWinner } = useDraws();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  const [isSelectNumberOpen, setIsSelectNumberOpen] = useState(false);

  const isAdmin = user?.isAdmin || false;
  const canPickWinner = isAdmin && (draw.status === 'active' || draw.status === 'open') && (draw.numberOfTickets || 0) > 0;
  const canEnterDraw = (draw.status === 'active' || draw.status === 'open') && user;
  
  const handlePickWinner = async () => {
    try {
      setIsPickingWinner(true);
      await pickWinner(draw.id);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error picking winner:", error);
    } finally {
      setIsPickingWinner(false);
    }
  };

  const handleEntrySuccess = () => {
    // Refresh the component or show success state
    console.log('Entry successful');
  };

  const getStatusBadgeColor = () => {
    switch (draw.status) {
      case 'active':
      case 'open':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (draw.status) {
      case 'active':
      case 'open':
        return 'Active';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <Card className="overflow-hidden backdrop-blur-sm bg-card/90 shadow-sm border-0">
        <div className="relative">
          {draw.bannerImage && (
            <div className="aspect-[2/1] w-full overflow-hidden p-4">
              <div className="w-full h-full luxury-card overflow-hidden">
                <img 
                  src={draw.bannerImage} 
                  alt={draw.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          <div className={`absolute top-6 right-6 ${getStatusBadgeColor()} text-white text-xs font-bold py-1 px-2 rounded-full`}>
            {getStatusLabel()}
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-bold text-xl mb-2">{draw.title}</h3>
          
          <div className="space-y-3 mb-4 text-sm">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {draw.startDate && format(new Date(draw.startDate), 'MMMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {draw.currentParticipants} / {draw.maxParticipants} participants
              </span>
            </div>
            
            {draw.winner && (
              <div className="flex items-center text-green-500">
                <Award className="h-4 w-4 mr-2" />
                <span className="font-medium">Winner: {draw.winner}</span>
              </div>
            )}
            
            {draw.status === 'upcoming' && (
              <div className="flex items-center text-yellow-500">
                <Lock className="h-4 w-4 mr-2" />
                <span>Opens {draw.startDate && format(new Date(draw.startDate), 'MMM d')}</span>
              </div>
            )}
            
            {(draw.status === 'active' || draw.status === 'open') && (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Entries: {draw.numberOfTickets || 0}</span>
              </div>
            )}

            {/* Show ticket prices */}
            {draw.ticketPrices && draw.ticketPrices.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Entry fees:</span>
                <div className="flex gap-1">
                  {draw.ticketPrices.map((price, index) => (
                    <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      ${price}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {canEnterDraw ? (
              <Button 
                variant="default" 
                className="flex-1" 
                onClick={() => setIsSelectNumberOpen(true)}
              >
                Enter Draw
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="flex-1" 
                onClick={() => navigate(`/draw/${draw.id}`)}
              >
                View Details
              </Button>
            )}
            
            {canPickWinner && (
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(true)}
              >
                Pick Winner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Winner Selection Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pick a Winner</AlertDialogTitle>
            <AlertDialogDescription>
              This will randomly select a winner for the draw "{draw.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPickingWinner}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={isPickingWinner}
              onClick={(e) => {
                e.preventDefault();
                handlePickWinner();
              }}
            >
              {isPickingWinner ? 'Selecting Winner...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Number Selection Modal */}
      <SelectNumberModal
        draw={draw}
        isOpen={isSelectNumberOpen}
        onClose={() => setIsSelectNumberOpen(false)}
        onSuccess={handleEntrySuccess}
      />
    </>
  );
};

export default DrawCard;
