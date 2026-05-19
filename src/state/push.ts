import { create } from 'zustand'

export type PushPermissionStatus =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'prompt-with-rationale'
  | 'unsupported'

type PushState = {
  ready: boolean
  permission: PushPermissionStatus
  token: string | null
  error: string | null
  lastReceivedAt: number | null
  setReady: (ready: boolean) => void
  setPermission: (permission: PushPermissionStatus) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  noteReceived: () => void
}

export const usePushStore = create<PushState>((set) => ({
  ready: false,
  permission: 'unsupported',
  token: null,
  error: null,
  lastReceivedAt: null,
  setReady: (ready) => set({ ready }),
  setPermission: (permission) => set({ permission }),
  setToken: (token) => set({ token, error: null }),
  setError: (error) => set({ error }),
  noteReceived: () => set({ lastReceivedAt: Date.now() }),
}))
