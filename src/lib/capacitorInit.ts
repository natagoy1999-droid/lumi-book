import { Capacitor } from '@capacitor/core'
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

/** Native shell setup — no-op in browser / PWA. */
export async function initCapacitorNative() {
  if (!Capacitor.isNativePlatform()) return

  document.documentElement.classList.add('cap-native')

  console.log('CAPACITOR READY')

  if (Capacitor.getPlatform() === 'android') {
    console.log('ANDROID PLATFORM READY')
    console.log('ANDROID APK READY')
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false })
    await StatusBar.setBackgroundColor({ color: '#F6F2EA' })
    await StatusBar.setStyle({ style: Style.Dark })
  } catch {
    // StatusBar unavailable on some webviews
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body })
  } catch {
    // Keyboard plugin optional at runtime
  }

  try {
    await SplashScreen.hide()
  } catch {
    // splash may already be hidden
  }
}
