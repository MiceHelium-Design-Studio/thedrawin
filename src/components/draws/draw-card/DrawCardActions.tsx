
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface DrawCardActionsProps {
  canEnterDraw: boolean;
  canPickWinner: boolean;
  drawId: string;
  onEnterDraw: () => void;
  onPickWinner: () => void;
  hideActions?: boolean;
}

const DrawCardActions: React.FC<DrawCardActionsProps> = ({
  canEnterDraw,
  canPickWinner,
  drawId,
  onEnterDraw,
  onPickWinner,
  hideActions = false
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (hideActions) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {canEnterDraw ? (
        <Button
          variant="default"
          className="flex-1"
          onClick={onEnterDraw}
        >
          {t('draws.enterDraw')}
        </Button>
      ) : (
        <Button
          variant="default"
          className="flex-1"
          onClick={() => navigate(`/draw/${drawId}`)}
        >
          {t('draws.viewDetails')}
        </Button>
      )}

      {canPickWinner && (
        <Button
          variant="outline"
          onClick={onPickWinner}
        >
          {t('draws.pickWinner.button')}
        </Button>
      )}
    </div>
  );
};

export default DrawCardActions;
