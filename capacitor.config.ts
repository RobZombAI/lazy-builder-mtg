import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lazybuilder.mtg',
  appName: 'Lazy Builder',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
