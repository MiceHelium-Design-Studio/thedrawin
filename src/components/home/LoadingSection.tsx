
import React from 'react';

const LoadingSection: React.FC = () => {
  return (
    <div className="space-y-12 luxury-fade-in">
      {/* Hero loading skeleton */}
      <div className="luxury-card relative overflow-hidden h-56 w-full">
        <div className="absolute inset-0 pattern-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/5 via-[#06B6D4]/5 to-[#F39C0A]/5" />
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#F39C0A]/10 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-[#F39C0A]/10 rounded-2xl flex items-center justify-center gold-pulse mx-auto border border-[#F39C0A]/20">
              <div className="w-10 h-10 bg-[#F39C0A] rounded-xl shadow-gold" />
            </div>
            <div className="text-[#F39C0A] font-semibold text-lg tracking-wide">
              Loading Experience<span className="loading-luxury"></span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cards grid loading */}
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="luxury-card h-40 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/5 to-[#F39C0A]/5" />
            <div className="absolute inset-0">
              <div 
                className="w-full h-full bg-gradient-to-r from-transparent via-[#06B6D4]/10 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            </div>
            <div className="relative z-10 p-6 space-y-4">
              <div className="w-3/4 h-5 bg-slate-800 rounded-lg gold-shimmer" />
              <div className="w-1/2 h-4 bg-slate-800 rounded-lg gold-shimmer" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Content loading */}
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#F39C0A]/10 rounded-xl gold-pulse border border-[#F39C0A]/20" />
          <div className="w-56 h-8 bg-slate-800 rounded-lg gold-shimmer" />
        </div>
        
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="luxury-card h-28 w-full relative overflow-hidden">
              <div className="absolute inset-0">
                <div 
                  className="w-full h-full bg-gradient-to-r from-transparent via-[#F39C0A]/10 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 300}ms` }}
                />
              </div>
              <div className="relative z-10 p-6 space-y-3">
                <div className="w-2/3 h-5 bg-slate-800 rounded-lg gold-shimmer" />
                <div className="w-1/3 h-4 bg-slate-800 rounded-lg gold-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSection;
