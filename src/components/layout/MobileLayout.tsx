
import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className }) => {
  const { isMobile, isNativeMobile } = useMobileDetection();

  useEffect(() => {
    // Set viewport meta tag for better mobile experience
    if (Capacitor.isNativePlatform()) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
      }
    }
  }, []);

  return (
    <div 
      className={cn(
        "min-h-screen relative",
        isNativeMobile && "pt-safe-area-inset-top pb-safe-area-inset-bottom",
        isMobile && "touch-manipulation select-none",
        Capacitor.isNativePlatform() && "capacitor-app",
        className
      )}
      style={{
        // Prevent zoom on input focus (iOS)
        fontSize: isMobile ? '16px' : undefined,
        // Disable text selection on mobile
        WebkitUserSelect: isMobile ? 'none' : 'auto',
        userSelect: isMobile ? 'none' : 'auto',
        // Disable callouts on iOS
        WebkitTouchCallout: 'none',
        // Disable tap highlighting
        WebkitTapHighlightColor: 'transparent',
        // Handle safe areas for Capacitor
        ...(Capacitor.isNativePlatform() && {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        })
      }}
    >
      {children}
    </div>
  );
};

export default MobileLayout;
