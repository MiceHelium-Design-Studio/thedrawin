
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
      {/* Premium background glow */}
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[rgb(var(--primary))]/10 rounded-full blur-3xl opacity-30" />
      
      <div className="relative z-10">
        <div className="mb-10 relative">
          {/* Premium logo container */}
          <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--primary))]/15 via-[rgb(var(--accent))]/8 to-[rgb(var(--primary))]/15 blur-3xl rounded-full scale-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))]/20 via-transparent to-[rgb(var(--accent))]/15 blur-2xl rounded-full animate-pulse" />
          
          <div className="relative">
            <img 
              src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
              alt="DRAWIN - The Future of Gaming" 
              className="max-w-[320px] md:max-w-[380px] lg:max-w-[500px] mx-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
            
            {/* Premium border ring */}
            <div className="absolute inset-0 rounded-full border border-[rgb(var(--primary))]/20 animate-pulse scale-110" />
          </div>
        </div>
        
        <div className="space-y-8 mb-12">
          <div className="space-y-4">
            {/* Title / Headline: 24pt / Semibold / White */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[rgb(var(--text-primary))] tracking-tight leading-none" style={{ fontSize: '24pt' }}>
              THE FUTURE OF{' '}
              <span className="bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--primary-hover))] to-[rgb(var(--primary))] bg-clip-text text-transparent animate-pulse">
                GAMING
              </span>
            </h1>
            
            {/* Premium subtitle */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgb(var(--primary))]/10 to-transparent blur-sm rounded-xl" />
              <p className="relative text-[rgb(var(--text-secondary))] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light" style={{ fontSize: '14pt' }}>
                Join exclusive draws, win premium prizes, and experience the next generation of{' '}
                <span className="text-[rgb(var(--primary))] font-semibold bg-[rgb(var(--primary))]/10 px-2 py-1 rounded-lg">
                  digital entertainment
                </span>
              </p>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[rgb(var(--text-muted))]">
            <div className="flex items-center space-x-2 luxury-card px-4 py-2" style={{ borderRadius: '999px', padding: '8px 16px' }}>
              <div className="w-2 h-2 bg-[rgb(var(--primary))] rounded-full animate-pulse" />
              <span>Secure & Fair</span>
            </div>
            <div className="flex items-center space-x-2 luxury-card px-4 py-2" style={{ borderRadius: '999px', padding: '8px 16px' }}>
              <div className="w-2 h-2 bg-[rgb(var(--success))] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span>Instant Wins</span>
            </div>
            <div className="flex items-center space-x-2 luxury-card px-4 py-2" style={{ borderRadius: '999px', padding: '8px 16px' }}>
              <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span>Premium Rewards</span>
            </div>
          </div>
        </div>
        
        {/* Premium authentication prompt for non-logged in users */}
        {!user && !authLoading && (
          <div className="mt-10 luxury-card max-w-xl mx-auto relative overflow-hidden">
            {/* Animated border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--primary))]/20 via-[rgb(var(--accent))]/15 to-[rgb(var(--primary))]/20 p-0.5" style={{ borderRadius: '24px' }}>
              <div className="bg-[rgb(var(--card))] w-full h-full" style={{ borderRadius: '20px' }} />
            </div>
            
            {/* Floating particles effect */}
            <div className="absolute top-4 left-8 w-2 h-2 bg-[rgb(var(--primary))]/30 rounded-full animate-pulse" />
            <div className="absolute bottom-6 right-12 w-1 h-1 bg-[rgb(var(--accent))]/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-[rgb(var(--primary))]/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10 p-10">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[rgb(var(--primary))]/20 to-[rgb(var(--accent))]/10 rounded-full flex items-center justify-center animate-pulse border border-[rgb(var(--primary))]/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-hover))] rounded-full animate-pulse" />
                  </div>
                  {/* Orbiting rings */}
                  <div className="absolute inset-0 border border-[rgb(var(--primary))]/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 border border-[rgb(var(--accent))]/15 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Section Label: 16pt / Medium / #F2F2F2 */}
                <h3 className="text-[rgb(var(--primary))] mb-4 font-medium text-lg tracking-wide" style={{ fontSize: '16pt' }}>
                  Ready to Enter the Arena?
                </h3>
                {/* Paragraph: 14pt / Regular / #CCCCCC */}
                <p className="text-[rgb(var(--text-muted))] mb-8 text-base leading-relaxed" style={{ fontSize: '14pt' }}>
                  Join thousands of players in the ultimate gaming experience where every draw could change your life
                </p>
                
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full luxury-button relative overflow-hidden group text-lg py-4 font-semibold tracking-wide"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
                
                {/* Small Label: 12pt / Uppercase / #AAAAAA */}
                <p className="text-label mt-4" style={{ fontSize: '12pt' }}>
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
