
import React from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className }) => {
  const { isMobile, isNativeMobile } = useMobileDetection();

  return (
    <div 
      className={cn(
        "min-h-screen",
        isNativeMobile && "pt-safe-area-inset-top pb-safe-area-inset-bottom",
        isMobile && "touch-manipulation select-none",
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
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {children}
    </div>
  );
};

export default MobileLayout;
