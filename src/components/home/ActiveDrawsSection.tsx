import React from 'react';
import { Button } from '@/components/ui/button';
import DrawCard from '../draws/DrawCard';
import { Draw } from '@/types';
import { useTranslation } from 'react-i18next';
interface ActiveDrawsSectionProps {
  activeDraws: Draw[];
  onViewAll: () => void;
}
const ActiveDrawsSection: React.FC<ActiveDrawsSectionProps> = ({
  activeDraws,
  onViewAll
}) => {
  const { t } = useTranslation();
  
  if (!activeDraws || activeDraws.length === 0) {
    return null;
  }
  return <section className="mb-16 relative">
      {/* Premium section background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/5 via-transparent to-[#06B6D4]/5 rounded-3xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#F39C0A]/10 flex items-center justify-center gold-pulse border border-[#F39C0A]/20 rounded-full px-[13px] mx-[13px] my-[21px]">
                
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {t('home.activeDrawsTitle')} <span className="bg-gold-gradient bg-clip-text text-transparent">{t('navigation.draws')}</span>
              </h2>
            </div>
            <div className="h-px w-32 bg-gradient-to-r from-[#F39C0A] to-transparent" />
            <p className="text-slate-400 text-lg">
              {t('home.activeDrawsSubtitle')}
            </p>
          </div>
          
          <Button variant="outline" size="lg" onClick={onViewAll} className="premium-outline-button group min-w-[160px]">
            <span className="relative z-10">{t('home.viewAllDraws')}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F39C0A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
        
        <div className="grid gap-8">
          {activeDraws.slice(0, 3).map((draw, index) => <div key={draw.id} className="luxury-fade-in relative" style={{
          animationDelay: `${index * 150}ms`
        }}>
              <DrawCard draw={draw} />
            </div>)}
        </div>
      </div>
    </section>;
};
export default ActiveDrawsSection;