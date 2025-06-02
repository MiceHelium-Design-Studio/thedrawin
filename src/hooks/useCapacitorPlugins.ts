
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export const useCapacitorPlugins = () => {
  useEffect(() => {
    const initializePlugins = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#000000' });
          await StatusBar.setOverlaysWebView({ overlay: false });

          // Hide splash screen after app is ready
          setTimeout(async () => {
            await SplashScreen.hide({
              fadeOutDuration: 300
            });
          }, 2000);

        } catch (error) {
          console.error('Error initializing Capacitor plugins:', error);
        }
      }
    };

    initializePlugins();
  }, []);

  const hideSplashScreen = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await SplashScreen.hide({
          fadeOutDuration: 300
        });
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    }
  };

  const setStatusBarStyle = async (style: 'light' | 'dark') => {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ 
          style: style === 'light' ? Style.Light : Style.Dark 
        });
      } catch (error) {
        console.error('Error setting status bar style:', error);
      }
    }
  };

  return {
    hideSplashScreen,
    setStatusBarStyle
  };
};
