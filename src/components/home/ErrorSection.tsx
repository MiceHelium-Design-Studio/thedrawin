
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorSectionProps {
  user: any;
}

const ErrorSection: React.FC<ErrorSectionProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Premium background effects */}
      <div className="fixed inset-0 pattern-bg pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-[#F39C0A]/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-[#F39C0A]/10 to-red-500/20 blur-3xl rounded-full" />
            <img 
              src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
              alt="DRAWIN - The Future of Gaming" 
              className="max-w-[280px] md:max-w-[320px] lg:max-w-[400px] mx-auto relative z-10 drop-shadow-2xl opacity-75"
            />
          </div>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join exciting draws, win amazing prizes, and be part of the ultimate gaming experience
          </p>
        </div>

        <div className="text-center py-16 luxury-card relative overflow-hidden max-w-2xl mx-auto">
          {/* Error animation background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-red-500/10" />
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent -translate-x-full animate-[shimmer_3s_linear_infinite]" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center gold-pulse border border-red-500/30">
                <div className="text-4xl text-red-400">⚠️</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                <span className="bg-gradient-to-r from-red-400 to-[#F39C0A] bg-clip-text text-transparent">
                  CONNECTION ERROR
                </span>
              </h3>
              <p className="text-slate-400 max-w-md mx-auto">
                We're experiencing a system issue while loading the draws. Please try refreshing the page.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="premium-outline-button group"
              >
                <span className="relative z-10">REFRESH PAGE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F39C0A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
              
              {!user && (
                <Button 
                  onClick={() => navigate('/login')} 
                  className="luxury-button group"
                >
                  <span className="relative z-10">SIGN IN</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorSection;
