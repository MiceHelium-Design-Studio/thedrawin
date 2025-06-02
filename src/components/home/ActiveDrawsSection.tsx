
import React from 'react';
import { Button } from '@/components/ui/button';
import DrawCard from '../draws/DrawCard';
import { Draw } from '@/types';

interface ActiveDrawsSectionProps {
  activeDraws: Draw[];
  onViewAll: () => void;
}

const ActiveDrawsSection: React.FC<ActiveDrawsSectionProps> = ({ activeDraws, onViewAll }) => {
  if (!activeDraws || activeDraws.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 relative">
      {/* Futuristic section background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-cyber-cyan/5 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gold-500/20 rounded-lg flex items-center justify-center cyber-pulse">
                <div className="w-4 h-4 bg-gold-500 rounded-sm neon-flicker" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-wide font-orbitron">
                <span className="cyber-text">
                  ACTIVE PROTOCOLS
                </span>
              </h2>
            </div>
            <div className="h-0.5 w-24 bg-gradient-to-r from-gold-500 to-transparent" />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            className="cyber-outline-button group"
          >
            <span className="relative z-10">VIEW ALL DRAWS</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
        
        <div className="grid gap-6 md:gap-8">
          {activeDraws.slice(0, 3).map((draw, index) => (
            <div 
              key={draw.id} 
              className="cyber-fade-in relative"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <DrawCard draw={draw} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActiveDrawsSection;
