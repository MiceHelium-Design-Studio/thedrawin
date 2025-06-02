
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
    <section className="mb-8 relative">
      {/* Futuristic section background */}
      <div className="absolute inset-0 bg-gradient-to-l from-cyber-cyan/5 via-transparent to-gold-500/5 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyber-cyan/20 rounded-lg flex items-center justify-center cyber-pulse">
                <div className="w-4 h-4 bg-cyber-cyan rounded-sm neon-flicker" />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-wide font-orbitron">
                <span className="bg-gradient-to-r from-cyber-cyan to-gold-500 bg-clip-text text-transparent">
                  ALL DRAWS
                </span>
              </h2>
            </div>
            <div className="h-0.5 w-20 bg-gradient-to-r from-cyber-cyan to-transparent" />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            className="cyber-outline-button group"
          >
            <span className="relative z-10">BROWSE ALL</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
        
        <div className="grid gap-6 md:gap-8">
          {draws && draws.length > 0 ? (
            draws.slice(0, 4).map((draw, index) => (
              <div 
                key={draw.id} 
                className="cyber-fade-in relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <DrawCard draw={draw} />
              </div>
            ))
          ) : (
            <div className="text-center py-16 cyber-card relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 cyber-grid opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-cyber-cyan/10" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center cyber-pulse">
                    <div className="text-4xl neon-flicker">🎯</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold cyber-text font-orbitron uppercase tracking-wide">
                    NO ACTIVE PROTOCOLS
                  </h3>
                  <p className="text-cyber-text max-w-md mx-auto font-inter">
                    New exciting draws are initializing. Stay connected to the network for updates.
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/notifications')}
                  className="cyber-outline-button group mt-6"
                >
                  <span className="relative z-10">ENABLE NOTIFICATIONS</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
