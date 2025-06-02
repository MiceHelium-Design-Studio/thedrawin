
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
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#F59E0B',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
      overlaysWebView: false
    }
  }
};

export default config;
