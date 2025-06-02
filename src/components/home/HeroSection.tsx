
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
    <div className="flex flex-col items-center mb-12 text-center relative">
      {/* Premium background glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/10 via-[#06B6D4]/5 to-[#F39C0A]/10 blur-3xl rounded-full" />
          <img 
            src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
            alt="DRAWIN - The Future of Gaming" 
            className="max-w-[300px] md:max-w-[350px] lg:max-w-[450px] mx-auto relative z-10 drop-shadow-2xl"
          />
        </div>
        
        <div className="space-y-6 mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            THE FUTURE OF <span className="bg-gold-gradient bg-clip-text text-transparent">GAMING</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join exclusive draws, win premium prizes, and experience the next generation of{' '}
            <span className="text-[#F39C0A] font-semibold">digital entertainment</span>
          </p>
        </div>
        
        {/* Premium authentication prompt for non-logged in users */}
        {!user && !authLoading && (
          <div className="mt-8 luxury-card max-w-lg mx-auto relative overflow-hidden">
            {/* Animated border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F39C0A]/10 via-[#06B6D4]/10 to-[#F39C0A]/10 p-0.5 rounded-2xl">
              <div className="bg-[#08080C] w-full h-full rounded-xl" />
            </div>
            
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#F39C0A]/10 rounded-full flex items-center justify-center gold-pulse border border-[#F39C0A]/20">
                  <div className="w-8 h-8 bg-[#F39C0A] rounded-full shadow-gold" />
                </div>
              </div>
              <h3 className="text-[#F39C0A] mb-4 font-semibold text-lg tracking-wide">
                Ready to Enter the Arena?
              </h3>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                Join thousands of players in the ultimate gaming experience
              </p>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full luxury-button relative overflow-hidden group text-base py-3"
              >
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
