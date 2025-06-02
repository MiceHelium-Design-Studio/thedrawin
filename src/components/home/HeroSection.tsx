
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
    <div className="flex flex-col items-center mb-8 text-center relative">
      {/* Futuristic background glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 via-cyber-cyan/10 to-gold-500/20 blur-3xl rounded-full" />
          <img 
            src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
            alt="DRAWIN - The First Draw & Win App" 
            className="max-w-[280px] md:max-w-[320px] lg:max-w-[400px] mx-auto relative z-10 drop-shadow-2xl"
          />
        </div>
        
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-orbitron font-bold cyber-text">
            THE FUTURE OF GAMING
          </h1>
          <p className="text-cyber-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-inter">
            Join exciting draws, win amazing prizes, and be part of the ultimate{' '}
            <span className="cyber-text font-semibold neon-flicker">gaming experience</span>
          </p>
        </div>
        
        {/* Authentication prompt for non-logged in users */}
        {!user && !authLoading && (
          <div className="mt-6 cyber-card max-w-md mx-auto relative overflow-hidden">
            {/* Animated border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 via-cyber-cyan/20 to-gold-500/20 p-0.5 rounded-xl">
              <div className="bg-cyber-dark w-full h-full rounded-lg" />
            </div>
            
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center cyber-pulse">
                  <div className="w-6 h-6 bg-gold-500 rounded-full neon-flicker" />
                </div>
              </div>
              <p className="text-gold-500 mb-4 font-orbitron font-semibold text-sm uppercase tracking-wide">
                READY TO ENTER THE CYBER ARENA?
              </p>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full futuristic-button relative overflow-hidden group"
              >
                <span className="relative z-10">INITIALIZE PROTOCOL</span>
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
