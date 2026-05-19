import { Capacitor } from '@capacitor/core'
import {
  PushNotifications,
  type PermissionStatus,
  type PushNotificationSchema,
} from '@capacitor/push-notifications'
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'

import { usePushStore, type PushPermissionStatus } from '../state/push'

export const LUMI_PUSH_CHANNEL_ID = 'lumi_book_default'

let listenersAttached = false
let initStarted = false
let firebaseApp: FirebaseApp | null = null

function mapPermission(receive: PermissionStatus['receive']): PushPermissionStatus {
  if (receive === 'granted' || receive === 'denied') return receive
  if (receive === 'prompt-with-rationale') return 'prompt-with-rationale'
  if (receive === 'prompt') return 'prompt'
  return 'unsupported'
}

/** Firebase JS SDK — optional; native FCM token comes from Capacitor registration. */
function initFirebaseIfConfigured() {
  if (firebaseApp || getApps().length > 0) return
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined
  if (!apiKey || !projectId || !appId) return

  firebaseApp = initializeApp({
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
    appId,
  })
}

function attachPushListeners() {
  if (listenersAttached) return
  listenersAttached = true

  void PushNotifications.addListener('registration', (token) => {
    console.log('FCM TOKEN', token.value)
    usePushStore.getState().setToken(token.value)
  })

  void PushNotifications.addListener('registrationError', (err) => {
    console.error('[push] registrationError', err)
    usePushStore.getState().setError(err.error ?? 'registration failed')
  })

  void PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    console.log('PUSH RECEIVED', notification)
    usePushStore.getState().noteReceived()
  })

  void PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('[push] actionPerformed', action)
  })
}

async function ensureAndroidChannel() {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    await PushNotifications.createChannel({
      id: LUMI_PUSH_CHANNEL_ID,
      name: 'LUMI BOOK',
      description: 'Записи и напоминания',
      importance: 4,
      visibility: 1,
      vibration: true,
    })
  } catch (e) {
    console.warn('[push] createChannel', e)
  }
}

export function isPushSupported() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export async function refreshPushPermissionStatus() {
  if (!isPushSupported()) {
    usePushStore.getState().setPermission('unsupported')
    return usePushStore.getState().permission
  }
  const status = await PushNotifications.checkPermissions()
  const permission = mapPermission(status.receive)
  usePushStore.getState().setPermission(permission)
  return permission
}

export async function requestPushPermission() {
  if (!isPushSupported()) return usePushStore.getState().permission

  const status = await PushNotifications.requestPermissions()
  const permission = mapPermission(status.receive)
  usePushStore.getState().setPermission(permission)

  if (permission === 'granted') {
    await PushNotifications.register()
  }

  return permission
}

/** Call once after auth bootstrap — registers listeners and optionally registers device. */
export async function initPushAfterAuth() {
  if (!isPushSupported() || initStarted) return
  initStarted = true

  initFirebaseIfConfigured()
  attachPushListeners()
  await ensureAndroidChannel()

  const permission = await refreshPushPermissionStatus()
  usePushStore.getState().setReady(true)
  console.log('PUSH READY')

  if (permission === 'granted') {
    await PushNotifications.register()
  }
}
