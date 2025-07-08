
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, Coins } from 'lucide-react';
import { useDraws } from '../context/DrawContext';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const Winners: React.FC = () => {
  const { draws } = useDraws();
  const { t } = useTranslation();
  
  // Filter completed draws with winners
  const completedDraws = draws.filter(
    draw => draw.status === 'completed' && draw.winner
  );
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F39C0A]/20 to-[#FFD700]/10 rounded-xl flex items-center justify-center border border-[#F39C0A]/20">
            <Award className="h-6 w-6 text-[#F39C0A]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            <span className="bg-gradient-to-r from-[#F39C0A] via-[#FFD700] to-[#F39C0A] bg-clip-text text-transparent">
              {t('winners.page.title')}
            </span>
          </h1>
        </div>
      </div>
      
      {completedDraws.length === 0 ? (
        <div className="text-center py-16 luxury-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/5 via-transparent to-[#06B6D4]/5" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F39C0A]/20 to-[#FFD700]/10 rounded-full flex items-center justify-center border border-[#F39C0A]/30">
                <Award className="h-10 w-10 text-[#F39C0A]" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white">{t('winners.page.noWinnersYet')}</h2>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                {t('winners.page.noWinnersMessage')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {completedDraws.map((draw, index) => (
            <Card key={draw.id} className="luxury-card overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <div className="bg-gradient-to-r from-[#F39C0A] to-[#FFD700] text-black px-6 py-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">{draw.title}</h2>
                <div className="flex items-center text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(draw.endDate), 'MMM d, yyyy')}
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide font-medium">{t('winners.page.winner')}</p>
                    <div className="flex items-center justify-center sm:justify-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#F39C0A]/20 to-[#FFD700]/10 rounded-lg flex items-center justify-center mr-3 border border-[#F39C0A]/30">
                        <Award className="h-4 w-4 text-[#F39C0A]" />
                      </div>
                      <p className="text-2xl font-bold text-white">{draw.winner}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center px-6 py-3 bg-gradient-to-r from-[#F39C0A]/10 to-[#FFD700]/5 rounded-full border border-[#F39C0A]/20">
                    <Coins className="h-5 w-5 text-[#F39C0A] mr-2" />
                    <span className="font-bold text-white">
                      ${Math.max(...draw.ticketPrices)} {t('winners.page.prize')}
                    </span>
                  </div>
                </div>
                
                {draw.description && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-slate-300 leading-relaxed">{draw.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Winners;
