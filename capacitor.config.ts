import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.belongIt.6dccdb47c0714678966e4af4d4786d52',
  appName: 'find-my-stuff-space',
  webDir: 'dist',
  server: {
    url: 'https://6dccdb47-c071-4678-966e-4af4d4786d52.belongItproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
