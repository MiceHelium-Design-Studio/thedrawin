
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
    <div className="flex flex-col items-center mb-8 text-center">
      <img 
        src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
        alt="DRAWIN - The First Draw & Win App" 
        className="max-w-[280px] md:max-w-[320px] lg:max-w-[400px] mx-auto mb-4"
      />
      <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        Join exciting draws, win amazing prizes, and be part of the ultimate gaming experience
      </p>
      
      {/* Authentication prompt for non-logged in users */}
      {!user && !authLoading && (
        <div className="mt-6 p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg max-w-md">
          <p className="text-gold-500 mb-3">Ready to enter draws and win prizes?</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold"
          >
            Sign Up / Login to Get Started
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
