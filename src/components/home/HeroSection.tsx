
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  user: any;
  authLoading: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ user, authLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center mb-16 text-center relative">
      {/* Enhanced premium background glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#F39C0A]/10 rounded-full blur-3xl opacity-30" />
      
      <div className="relative z-10">
        <div className="mb-10 relative">
          {/* Enhanced logo container with premium effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/15 via-[#06B6D4]/8 to-[#F39C0A]/15 blur-3xl rounded-full scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/20 via-transparent to-[#06B6D4]/15 blur-2xl rounded-full animate-pulse" />
          
          <div className="relative">
            <img 
              src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
              alt="DRAWIN - The Future of Gaming" 
              className="max-w-[320px] md:max-w-[380px] lg:max-w-[500px] mx-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
            
            {/* Premium border ring */}
            <div className="absolute inset-0 rounded-full border border-[#F39C0A]/20 animate-pulse scale-110" />
          </div>
        </div>
        
        <div className="space-y-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none">
              THE FUTURE OF{' '}
              <span className="bg-gradient-to-r from-[#F39C0A] via-[#FFD700] to-[#F39C0A] bg-clip-text text-transparent animate-pulse">
                GAMING
              </span>
            </h1>
            
            {/* Enhanced subtitle with premium styling */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F39C0A]/10 to-transparent blur-sm rounded-xl" />
              <p className="relative text-slate-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                Join exclusive draws, win premium prizes, and experience the next generation of{' '}
                <span className="text-[#F39C0A] font-semibold bg-[#F39C0A]/10 px-2 py-1 rounded-lg">
                  digital entertainment
                </span>
              </p>
            </div>
          </div>
          
          {/* Enhanced feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-[#F39C0A] rounded-full animate-pulse" />
              <span>Secure & Fair</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-[#06B6D4] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span>Instant Wins</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-[#F39C0A] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span>Premium Rewards</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced authentication prompt for non-logged in users */}
        {!user && !authLoading && (
          <div className="mt-10 luxury-card max-w-xl mx-auto relative overflow-hidden">
            {/* Enhanced animated border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/20 via-[#06B6D4]/15 to-[#F39C0A]/20 p-0.5 rounded-2xl">
              <div className="bg-[#08080C] w-full h-full rounded-xl" />
            </div>
            
            {/* Floating particles effect */}
            <div className="absolute top-4 left-8 w-2 h-2 bg-[#F39C0A]/30 rounded-full animate-pulse" />
            <div className="absolute bottom-6 right-12 w-1 h-1 bg-[#06B6D4]/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-[#F39C0A]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10 p-10">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-full flex items-center justify-center gold-pulse border border-[#F39C0A]/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F39C0A] to-[#FFD700] rounded-full shadow-gold animate-pulse" />
                  </div>
                  {/* Orbiting rings */}
                  <div className="absolute inset-0 border border-[#F39C0A]/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 border border-[#06B6D4]/15 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-[#F39C0A] mb-4 font-bold text-xl tracking-wide">
                  Ready to Enter the Arena?
                </h3>
                <p className="text-slate-400 mb-8 text-base leading-relaxed">
                  Join thousands of players in the ultimate gaming experience where every draw could change your life
                </p>
                
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full luxury-button relative overflow-hidden group text-lg py-4 font-bold tracking-wide"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
                
                <p className="text-xs text-slate-500 mt-4">
                  No hidden fees • Instant payouts • 24/7 support
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
