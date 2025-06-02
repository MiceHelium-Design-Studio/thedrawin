
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.894ce5f61f4345e598adb30e398b52b3',
  appName: 'thedrawin',
  webDir: 'dist',
  server: {
    url: 'https://894ce5f6-1f43-45e5-98ad-b30e398b52b3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    }
  }
};

export default config;
