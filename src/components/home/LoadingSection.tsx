
import React from 'react';

const LoadingSection: React.FC = () => {
  return (
    <div className="space-y-8 cyber-fade-in">
      {/* Hero loading skeleton */}
      <div className="cyber-card relative overflow-hidden h-48 w-full">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-cyber-cyan/10 to-gold-500/10" />
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-gold-500/20 to-transparent -translate-x-full animate-data-flow" />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center cyber-pulse mx-auto">
              <div className="w-8 h-8 bg-gold-500 rounded-full neon-flicker" />
            </div>
            <div className="text-gold-500 font-orbitron font-bold text-sm uppercase tracking-wide">
              INITIALIZING PROTOCOL<span className="loading-cyber"></span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cards grid loading */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="cyber-card h-32 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 to-gold-500/10" />
            <div className="absolute inset-0">
              <div 
                className="w-full h-full bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent -translate-x-full animate-data-flow"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            </div>
            <div className="relative z-10 p-4 space-y-3">
              <div className="w-3/4 h-4 bg-cyber-surface rounded hologram-shimmer" />
              <div className="w-1/2 h-3 bg-cyber-surface rounded hologram-shimmer" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Content loading */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gold-500/20 rounded-lg cyber-pulse" />
          <div className="w-48 h-8 bg-cyber-surface rounded hologram-shimmer" />
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="cyber-card h-24 w-full relative overflow-hidden">
              <div className="absolute inset-0">
                <div 
                  className="w-full h-full bg-gradient-to-r from-transparent via-gold-500/20 to-transparent -translate-x-full animate-data-flow"
                  style={{ animationDelay: `${i * 300}ms` }}
                />
              </div>
              <div className="relative z-10 p-4 space-y-2">
                <div className="w-2/3 h-4 bg-cyber-surface rounded hologram-shimmer" />
                <div className="w-1/3 h-3 bg-cyber-surface rounded hologram-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSection;
