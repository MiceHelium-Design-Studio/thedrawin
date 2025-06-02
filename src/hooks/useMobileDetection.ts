
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNativeMobile, setIsNativeMobile] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor (native mobile app)
    const checkCapacitor = () => {
      return !!(window as any).Capacitor;
    };

    // Check if mobile device based on user agent
    const checkMobileUserAgent = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Check screen size
    const checkScreenSize = () => {
      return window.innerWidth <= 768;
    };

    const updateMobileStatus = () => {
      const nativeMobile = checkCapacitor();
      const mobile = nativeMobile || checkMobileUserAgent() || checkScreenSize();
      
      setIsNativeMobile(nativeMobile);
      setIsMobile(mobile);
    };

    updateMobileStatus();
    window.addEventListener('resize', updateMobileStatus);

    return () => window.removeEventListener('resize', updateMobileStatus);
  }, []);

  return { isMobile, isNativeMobile };
};
