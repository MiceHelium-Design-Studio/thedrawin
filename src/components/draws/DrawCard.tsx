
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useDraws } from '@/context/DrawContext/index';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import SelectNumberModal from './draw-detail/SelectNumberModal';
import DrawCardImage from './draw-card/DrawCardImage';
import DrawCardContent from './draw-card/DrawCardContent';
import { Draw } from '@/types';
import { useTranslation } from 'react-i18next';

interface DrawCardProps {
  draw: Draw;
  hideActions?: boolean;
}

const DrawCard: React.FC<DrawCardProps> = ({ draw, hideActions = false }) => {
  const { user } = useAuth();
  const { pickWinner } = useDraws();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  const [isSelectNumberOpen, setIsSelectNumberOpen] = useState(false);
  const { t } = useTranslation();

  const isAdmin = user?.isAdmin || false;
  const canPickWinner = isAdmin && (draw.status === 'active' || draw.status === 'open') && (draw.numberOfTickets || 0) > 0;
  const canEnterDraw = (draw.status === 'active' || draw.status === 'open') && !!user;

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

  return (
    <>
      <Card className="overflow-hidden backdrop-blur-sm bg-card/90 shadow-sm border-0">
        <DrawCardImage
          bannerImage={draw.bannerImage}
          title={draw.title}
          status={draw.status}
        />

        <DrawCardContent
          draw={draw}
          canEnterDraw={canEnterDraw}
          canPickWinner={canPickWinner}
          onEnterDraw={() => setIsSelectNumberOpen(true)}
          onPickWinner={() => setIsDialogOpen(true)}
          hideActions={hideActions}
        />
      </Card>

      {/* Winner Selection Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('draws.pickWinner.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('draws.pickWinner.description', { title: draw.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPickingWinner}>{t('draws.pickWinner.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPickingWinner}
              onClick={(e) => {
                e.preventDefault();
                handlePickWinner();
              }}
            >
              {isPickingWinner ? t('draws.pickWinner.selecting') : t('draws.pickWinner.confirm')}
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
