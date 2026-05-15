import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.lumibook.app',
  appName: 'LUMI BOOK',
  webDir: 'dist',
  /** Capacitor 3+ ships without bundled web runtime; explicit for store tooling. */
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#F6F2EA',
    },
    SplashScreen: {
      backgroundColor: '#F6F2EA',
      launchShowDuration: 0,
      launchAutoHide: true,
      showSpinner: false,
    },
  },
}

export default config
