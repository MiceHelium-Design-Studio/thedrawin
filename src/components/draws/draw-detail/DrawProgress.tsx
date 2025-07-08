
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface DrawProgressProps {
  currentParticipants: number;
  maxParticipants: number;
  endDate: string;
  title: string;
}

export const DrawProgress = ({ currentParticipants, maxParticipants, endDate, title }: DrawProgressProps) => {
  const progress = (currentParticipants / maxParticipants) * 100;
  const { t } = useTranslation();
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{t('draws.detail.entriesProgress', { current: currentParticipants, max: maxParticipants })}</span>
        <span>
          {t('draws.detail.ends', { time: formatDistanceToNow(new Date(endDate), { addSuffix: true }) })}
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2" 
        label={`${title} entries progress: ${currentParticipants} of ${maxParticipants}`}
      />
    </div>
  );
};
