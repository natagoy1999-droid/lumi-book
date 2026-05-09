import { create } from 'zustand'

import type { InstallPromptEvent } from '../lib/installPrompt'
import { isStandalone } from '../lib/installPrompt'

type InstallState = {
  available: boolean
  installed: boolean
  deferred: InstallPromptEvent | null
  lastShownAt: number
  noteShown: () => void
  canShowPrompt: () => boolean
  setDeferred: (e: InstallPromptEvent | null) => void
  markInstalled: () => void
}

const KEY = 'lumi_install_prompt_v1'

function readLastShown(): number {
  try {
    const raw = localStorage.getItem(KEY)
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function writeLastShown(v: number) {
  try {
    localStorage.setItem(KEY, String(v))
  } catch {
    // ignore
  }
}

export const useInstall = create<InstallState>((set, get) => ({
  available: false,
  installed: isStandalone(),
  deferred: null,
  lastShownAt: readLastShown(),
  noteShown: () =>
    set((s) => {
      const now = Date.now()
      writeLastShown(now)
      return { ...s, lastShownAt: now }
    }),
  canShowPrompt: () => {
    const s = get()
    const now = Date.now()
    // show at most once per 5 days
    const cooldownMs = 5 * 24 * 60 * 60 * 1000
    return now - (s.lastShownAt || 0) > cooldownMs
  },
  setDeferred: (e) => set({ deferred: e, available: Boolean(e), installed: isStandalone() }),
  markInstalled: () => set({ installed: true, available: false, deferred: null }),
}))

