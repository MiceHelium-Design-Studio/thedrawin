import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, Trophy } from 'lucide-react';
import { testSupabaseConnection } from '@/utils/supabaseTest';
import { useTranslation } from 'react-i18next';

interface DrawCompleteProps {
  status: string;
  winner?: string;
  winnerTicketNumber?: number | null;
  title?: string;
  endDate?: string;
}

const DrawComplete: React.FC<DrawCompleteProps> = ({ 
  status, 
  winner, 
  winnerTicketNumber, 
  title, 
  endDate 
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const testConnection = async () => {
      try {
        await testSupabaseConnection();
      } catch (error) {
        console.error('Supabase connection test failed:', error);
      }
    };

    testConnection();
  }, []);

  // If there's a winner, show the winner announcement
  if (winner) {
    return (
      <Card className="luxury-card">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/10 via-transparent to-[#FFD700]/5 rounded-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl"></div>
        
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            {/* Winner Circle */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#F39C0A]/20 to-[#FFD700]/10 rounded-full flex items-center justify-center border-4 border-[#F39C0A]/30">
                <Award className="h-12 w-12 text-[#F39C0A]" />
              </div>
            </div>
            
            {/* Winner Information */}
            <div className="space-y-4">
              <div>
                <p className="text-lg text-slate-400 mb-2">{t('draws.complete.champion')}</p>
                <h3 className="text-4xl font-bold text-white bg-gradient-to-r from-[#F39C0A] to-[#FFD700] bg-clip-text text-transparent">
                  {winner}
                </h3>
              </div>
              
              {winnerTicketNumber && (
                <div className="bg-gradient-to-br from-[#F39C0A]/10 to-[#FFD700]/5 rounded-xl p-6 border border-[#F39C0A]/20">
                  <p className="text-slate-400 mb-2">{t('draws.complete.winningNumber')}</p>
                  <p className="text-3xl font-bold text-[#F39C0A]">#{winnerTicketNumber}</p>
                </div>
              )}
              
              {endDate && (
                <div className="flex items-center justify-center text-slate-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{t('draws.complete.completedOn', { date: new Date(endDate).toLocaleDateString() })}</span>
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <p className="text-slate-300 text-lg">
                {t('draws.complete.congratulationsText')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default completed state without winner
  return (
    <Card className="luxury-card">
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-500/20 to-slate-600/10 rounded-full flex items-center justify-center mx-auto">
            <Award className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{t('draws.complete.drawCompleted')}</h3>
          <p className="text-slate-400">{t('draws.complete.drawEnded')}</p>
          {status !== 'completed' && (
            <p className="text-slate-500">{t('draws.complete.status', { status })}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DrawComplete;
