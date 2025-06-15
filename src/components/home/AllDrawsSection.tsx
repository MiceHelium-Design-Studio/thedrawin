
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DrawCard from '../draws/DrawCard';
import { Draw } from '@/types';

interface AllDrawsSectionProps {
  draws: Draw[];
  onViewAll: () => void;
}

const AllDrawsSection: React.FC<AllDrawsSectionProps> = ({ draws, onViewAll }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-12 relative">
      {/* Premium section background */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#06B6D4]/5 via-transparent to-[#F39C0A]/5 rounded-3xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4]/20 to-[#F39C0A]/10 rounded-xl flex items-center justify-center border border-[#06B6D4]/30">
                <div className="w-5 h-5 bg-gradient-to-br from-[#06B6D4] to-[#0EA5E9] rounded-sm shadow-lg" />
              </div>
              <h2 className="text-3xl font-bold text-white uppercase tracking-wide">
                <span className="bg-gradient-to-r from-[#06B6D4] via-[#0EA5E9] to-[#F39C0A] bg-clip-text text-transparent">
                  ALL DRAWS
                </span>
              </h2>
            </div>
            <div className="h-0.5 w-24 bg-gradient-to-r from-[#06B6D4] to-transparent rounded-full" />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            className="premium-outline-button group border-2 border-[#06B6D4] text-[#06B6D4] font-bold"
          >
            <span className="relative z-10">BROWSE ALL</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#06B6D4]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
        
        <div className="grid gap-8 md:gap-10">
          {draws && draws.length > 0 ? (
            draws.slice(0, 4).map((draw, index) => (
              <div 
                key={draw.id} 
                className="luxury-fade-in relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <DrawCard draw={draw} />
              </div>
            ))
          ) : (
            <div className="text-center py-20 luxury-card relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 pattern-bg opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/10 via-transparent to-[#06B6D4]/10" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#F39C0A]/20 to-[#FFD700]/10 rounded-full flex items-center justify-center border border-[#F39C0A]/30">
                    <div className="text-5xl">🎯</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
                    NO ACTIVE DRAWS
                  </h3>
                  <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                    New exciting draws are being prepared. Stay tuned for amazing opportunities.
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/notifications')}
                  className="premium-outline-button group mt-8 border-2 border-[#F39C0A] text-[#F39C0A] font-bold"
                >
                  <span className="relative z-10">ENABLE NOTIFICATIONS</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F39C0A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AllDrawsSection;
