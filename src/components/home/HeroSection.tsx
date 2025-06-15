
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
    <div className="flex flex-col items-center mb-20 text-center relative">
      {/* Premium background glow */}
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#F39C0A]/10 rounded-full blur-3xl opacity-30" />
      
      <div className="relative z-10">
        <div className="mb-12 relative">
          {/* Premium logo container */}
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
        
        <div className="space-y-10 mb-16">
          <div className="space-y-6">
            {/* Perfectly aligned title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none">
              THE FUTURE OF{' '}
              <span className="bg-gradient-to-r from-[#F39C0A] via-[#FFD700] to-[#F39C0A] bg-clip-text text-transparent animate-pulse">
                GAMING
              </span>
            </h1>
            
            {/* Premium subtitle with perfect spacing */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F39C0A]/10 to-transparent blur-sm rounded-xl" />
              <p className="relative text-slate-300 text-lg md:text-xl leading-relaxed font-light px-4">
                Join exclusive draws, win premium prizes, and experience the next generation of{' '}
                <span className="text-[#F39C0A] font-semibold bg-[#F39C0A]/10 px-3 py-1 rounded-lg border border-[#F39C0A]/20">
                  digital entertainment
                </span>
              </p>
            </div>
          </div>
          
          {/* Perfectly aligned feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-3 luxury-card px-6 py-3 border border-[#F39C0A]/20">
              <div className="w-2 h-2 bg-[#F39C0A] rounded-full animate-pulse" />
              <span className="text-white font-medium">Secure & Fair</span>
            </div>
            <div className="flex items-center space-x-3 luxury-card px-6 py-3 border border-[#19C37D]/20">
              <div className="w-2 h-2 bg-[#19C37D] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-white font-medium">Instant Wins</span>
            </div>
            <div className="flex items-center space-x-3 luxury-card px-6 py-3 border border-[#06B6D4]/20">
              <div className="w-2 h-2 bg-[#06B6D4] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span className="text-white font-medium">Premium Rewards</span>
            </div>
          </div>
        </div>
        
        {/* Premium authentication prompt for non-logged in users */}
        {!user && !authLoading && (
          <div className="mt-12 luxury-card max-w-2xl mx-auto relative overflow-hidden">
            {/* Animated border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/20 via-[#06B6D4]/15 to-[#F39C0A]/20 p-0.5 rounded-3xl">
              <div className="bg-[#1F1D36] w-full h-full rounded-[22px]" />
            </div>
            
            {/* Floating particles effect */}
            <div className="absolute top-6 left-10 w-2 h-2 bg-[#F39C0A]/30 rounded-full animate-pulse" />
            <div className="absolute bottom-8 right-14 w-1 h-1 bg-[#06B6D4]/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-10 w-1.5 h-1.5 bg-[#F39C0A]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10 p-12">
              <div className="flex items-center justify-center mb-10">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-full flex items-center justify-center animate-pulse border border-[#F39C0A]/30">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F39C0A] to-[#FFD700] rounded-full animate-pulse" />
                  </div>
                  {/* Orbiting rings */}
                  <div className="absolute inset-0 border border-[#F39C0A]/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 border border-[#06B6D4]/15 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                </div>
              </div>
              
              <div className="space-y-8 text-center">
                <h3 className="text-[#F39C0A] mb-6 font-bold text-xl tracking-wide">
                  Ready to Enter the Arena?
                </h3>
                <p className="text-slate-300 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
                  Join thousands of players in the ultimate gaming experience where every draw could change your life
                </p>
                
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full max-w-sm mx-auto luxury-button relative overflow-hidden group text-lg py-6 font-bold tracking-wide"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
                
                <p className="text-slate-400 mt-6 text-sm uppercase tracking-widest font-medium">
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
