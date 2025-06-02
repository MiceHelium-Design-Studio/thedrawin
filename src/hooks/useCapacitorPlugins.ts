
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Use dynamic imports to handle potential module resolution issues
const initializeCapacitorPlugins = async () => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    
    return { SplashScreen, StatusBar, Style };
  } catch (error) {
    console.warn('Capacitor plugins not available:', error);
    return null;
  }
};

export const useCapacitorPlugins = () => {
  useEffect(() => {
    const initializePlugins = async () => {
      const plugins = await initializeCapacitorPlugins();
      
      if (!plugins) {
        console.log('Capacitor plugins not available or not running on native platform');
        return;
      }

      const { SplashScreen, StatusBar, Style } = plugins;

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
    };

    initializePlugins();
  }, []);

  const hideSplashScreen = async () => {
    const plugins = await initializeCapacitorPlugins();
    
    if (!plugins) {
      console.log('SplashScreen not available');
      return;
    }

    try {
      await plugins.SplashScreen.hide({
        fadeOutDuration: 300
      });
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  };

  const setStatusBarStyle = async (style: 'light' | 'dark') => {
    const plugins = await initializeCapacitorPlugins();
    
    if (!plugins) {
      console.log('StatusBar not available');
      return;
    }

    try {
      await plugins.StatusBar.setStyle({ 
        style: style === 'light' ? plugins.Style.Light : plugins.Style.Dark 
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  };

  return {
    hideSplashScreen,
    setStatusBarStyle
  };
};
