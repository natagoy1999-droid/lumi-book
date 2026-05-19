import { Capacitor } from '@capacitor/core'
import {
  PushNotifications,
  type ActionPerformed,
  type PermissionStatus,
  type PushNotificationSchema,
  type Token,
} from '@capacitor/push-notifications'
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { create } from 'zustand'

const PUSH_CHANNEL_ID = 'lumi_book_default'

export type PushPermissionState = PermissionStatus['receive'] | 'unsupported' | 'unknown'

type PushStoreState = {
  ready: boolean
  supported: boolean
  permission: PushPermissionState
  token: string | null
  lastError: string | null
}

export const usePushStore = create<PushStoreState>(() => ({
  ready: false,
  supported: false,
  permission: 'unknown',
  token: null,
  lastError: null,
}))

let listenersAttached = false
let firebaseApp: FirebaseApp | null = null

/** Push/FCM — только нативное Android-приложение (не PWA / браузер). */
function isAndroidNative(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

/** Optional Firebase JS SDK (web config); native FCM uses Capacitor Push Notifications. */
function ensureFirebaseApp(): FirebaseApp | null {
  if (firebaseApp) return firebaseApp

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined

  if (!apiKey || !projectId || !appId) return null

  try {
    firebaseApp = initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    })
    console.log('[push] Firebase JS initialized', projectId)
    return firebaseApp
  } catch (e) {
    console.warn('[push] Firebase initializeApp skipped', e)
    return null
  }
}

async function attachPushListeners(): Promise<void> {
  if (listenersAttached) return
  listenersAttached = true

  await PushNotifications.addListener('registration', (token: Token) => {
    console.log('FCM TOKEN', token.value)
    usePushStore.setState({ token: token.value, lastError: null })
  })

  await PushNotifications.addListener('registrationError', (err) => {
    const message = err?.error ?? 'registration failed'
    console.error('PUSH REGISTRATION ERROR', message)
    usePushStore.setState({ lastError: message })
  })

  await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('PUSH RECEIVED', notification)
  })

  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action: ActionPerformed) => {
      console.log('PUSH ACTION', action)
    },
  )
}

async function ensureAndroidChannel(): Promise<void> {
  try {
    await PushNotifications.createChannel({
      id: PUSH_CHANNEL_ID,
      name: 'LUMI BOOK',
      description: 'Записи и напоминания',
      importance: 4,
      visibility: 1,
      vibration: true,
    })
  } catch {
    // channel may already exist
  }
}

export async function refreshPushPermissionStatus(): Promise<PushPermissionState> {
  if (!isAndroidNative()) {
    usePushStore.setState({ supported: false, permission: 'unsupported' })
    return 'unsupported'
  }

  const status = await PushNotifications.checkPermissions()
  usePushStore.setState({ permission: status.receive, supported: true })
  return status.receive
}

/** Register with FCM when permission already granted. */
export async function registerPushDevice(): Promise<void> {
  if (!isAndroidNative()) return
  const { permission } = usePushStore.getState()
  const current =
    permission === 'unknown' ? await refreshPushPermissionStatus() : permission
  if (current !== 'granted') return
  await PushNotifications.register()
}

export async function requestPushPermissions(): Promise<PushPermissionState> {
  if (!isAndroidNative()) {
    usePushStore.setState({ permission: 'unsupported', supported: false })
    return 'unsupported'
  }

  const result = await PushNotifications.requestPermissions()
  usePushStore.setState({ permission: result.receive, supported: true })

  if (result.receive === 'granted') {
    await PushNotifications.register()
  }

  return result.receive
}

/** Request permission + register (Settings CTA). */
export async function requestPushPermissionsAndRegister(): Promise<void> {
  await requestPushPermissions()
}

export function pushPermissionLabel(permission: PushPermissionState): string {
  switch (permission) {
    case 'granted':
      return 'Разрешены'
    case 'denied':
      return 'Запрещены'
    case 'prompt':
    case 'prompt-with-rationale':
      return 'Нужно разрешение'
    case 'unsupported':
      return 'Только в Android-приложении'
    default:
      return 'Не проверено'
  }
}

/**
 * Called after auth bootstrap / login — attaches listeners, checks permission, registers if allowed.
 */
export async function initPushAfterAuth(): Promise<void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return

  ensureFirebaseApp()
  await attachPushListeners()
  await ensureAndroidChannel()

  const permission = await refreshPushPermissionStatus()

  if (permission === 'granted') {
    await registerPushDevice()
  }

  usePushStore.setState({ ready: true })
  console.log('PUSH READY')
}
