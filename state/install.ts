import { create } from 'zustand'

import type { InstallPromptEvent } from '../lib/installPrompt'
import { isStandalone } from '../lib/installPrompt'

type InstallState = {
  available: boolean
  installed: boolean
  deferred: InstallPromptEvent | null
  setDeferred: (e: InstallPromptEvent | null) => void
  markInstalled: () => void
}

export const useInstall = create<InstallState>((set) => ({
  available: false,
  installed: isStandalone(),
  deferred: null,
  setDeferred: (e) => set({ deferred: e, available: Boolean(e), installed: isStandalone() }),
  markInstalled: () => set({ installed: true, available: false, deferred: null }),
}))

