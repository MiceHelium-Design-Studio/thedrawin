import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DrawCard from '../draws/DrawCard';
import { Draw } from '@/types';
interface AllDrawsSectionProps {
  draws: Draw[];
  onViewAll: () => void;
}
const AllDrawsSection: React.FC<AllDrawsSectionProps> = ({
  draws,
  onViewAll
}) => {
  const navigate = useNavigate();
  return <section className="mb-8 relative">
      {/* Premium section background */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#06B6D4]/5 via-transparent to-[#F39C0A]/5 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="">
                <div className="w-4 h-4 w-40 rounded-bl-sm bg-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
                <span className="bg-gradient-to-r from-[#06B6D4] to-[#F39C0A] bg-clip-text text-yellow-400">
                  ALL DRAWS
                </span>
              </h2>
            </div>
            <div className="h-0.5 w-20 bg-gradient-to-r from-[#06B6D4] to-transparent" />
          </div>
          
          
        </div>
        
        <div className="grid gap-6 md:gap-8">
          {draws && draws.length > 0 ? draws.slice(0, 4).map((draw, index) => <div key={draw.id} className="luxury-fade-in relative" style={{
          animationDelay: `${index * 100}ms`
        }}>
                <DrawCard draw={draw} />
              </div>) : <div className="text-center py-16 luxury-card relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 pattern-bg opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/10 via-transparent to-[#06B6D4]/10" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-[#F39C0A]/20 rounded-full flex items-center justify-center gold-pulse border border-[#F39C0A]/20">
                    <div className="text-4xl">🎯</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                    NO ACTIVE DRAWS
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    New exciting draws are being prepared. Stay tuned for amazing opportunities.
                  </p>
                </div>
                
                <Button variant="outline" onClick={() => navigate('/notifications')} className="premium-outline-button group mt-6">
                  <span className="relative z-10">ENABLE NOTIFICATIONS</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F39C0A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </div>}
        </div>
      </div>
    </section>;
};
export default AllDrawsSection;