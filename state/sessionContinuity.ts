import { create } from 'zustand'

import type { MessageDraft } from './messaging'

export type ContextScenario =
  | 'reschedule_queue'
  | 'confirm_queue'
  | 'schedule'
  | 'clients'
  | 'composer_followup'
  | 'idle'

const STORAGE_KEY = 'lumi_session_ctx_v1'

type PersistShape = {
  abandonedComposerAt: number | null
  abandonedClientId: string | null
  lastPrimaryPath: string
  lastScenario: ContextScenario | null
}

function loadPersist(): Partial<PersistShape> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as PersistShape
  } catch {
    return {}
  }
}

function savePersist(p: PersistShape) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* ignore quota */
  }
}

/**
 * Session continuity — tab-scoped memory (sessionStorage), no cloud.
 */
export const useSessionContinuity = create<{
  lastPrimaryPath: string
  lastScenario: ContextScenario | null
  /** Composer closed with substantial draft — soft follow-up signal only. */
  abandonedComposerAt: number | null
  abandonedClientId: string | null
  visibilityHiddenAt: number | null
  /** True once after returning from background — consumed by gentle hints. */
  justResumedFromBackground: boolean
  recordSessionPath: (path: string) => void
  recordDraftAbandoned: (draft: MessageDraft) => void
  clearAbandonedComposer: () => void
  markVisibility: (visible: boolean) => void
  consumeResumePulse: () => void
  hydrateFromStorage: () => void
}>((set, get) => ({
  lastPrimaryPath: '/today',
  lastScenario: null,
  abandonedComposerAt: null,
  abandonedClientId: null,
  visibilityHiddenAt: null,
  justResumedFromBackground: false,

  hydrateFromStorage: () => {
    const p = loadPersist()
    set({
      abandonedComposerAt: p.abandonedComposerAt ?? null,
      abandonedClientId: p.abandonedClientId ?? null,
      lastPrimaryPath: p.lastPrimaryPath ?? '/today',
      lastScenario: p.lastScenario ?? null,
    })
  },

  recordSessionPath: (path) => {
    const scenario = inferScenarioFromPath(path)
    const s = get()
    set({ lastPrimaryPath: path, lastScenario: scenario })
    savePersist({
      abandonedComposerAt: s.abandonedComposerAt,
      abandonedClientId: s.abandonedClientId,
      lastPrimaryPath: path,
      lastScenario: scenario,
    })
  },

  recordDraftAbandoned: (draft) => {
    if (draft.text.trim().length < 14) return
    const t = Date.now()
    const s = get()
    set({ abandonedComposerAt: t, abandonedClientId: draft.clientId })
    savePersist({
      abandonedComposerAt: t,
      abandonedClientId: draft.clientId,
      lastPrimaryPath: s.lastPrimaryPath,
      lastScenario: s.lastScenario ?? 'composer_followup',
    })
  },

  clearAbandonedComposer: () => {
    const s = get()
    set({
      abandonedComposerAt: null,
      abandonedClientId: null,
    })
    savePersist({
      abandonedComposerAt: null,
      abandonedClientId: null,
      lastPrimaryPath: s.lastPrimaryPath,
      lastScenario: s.lastScenario,
    })
  },

  markVisibility: (visible) => {
    const now = Date.now()
    const s = get()
    if (!visible) {
      set({ visibilityHiddenAt: now })
      return
    }
    const hiddenAt = s.visibilityHiddenAt
    if (hiddenAt && now - hiddenAt > 55_000) {
      set({ justResumedFromBackground: true, visibilityHiddenAt: null })
      window.setTimeout(() => get().consumeResumePulse(), 95_000)
    } else {
      set({ visibilityHiddenAt: null })
    }
  },

  consumeResumePulse: () => set({ justResumedFromBackground: false }),
}))

function inferScenarioFromPath(path: string): ContextScenario {
  if (path.startsWith('/reschedule')) return 'reschedule_queue'
  if (path.startsWith('/calendar/new')) return 'schedule'
  if (path.startsWith('/calendar')) return 'schedule'
  if (path.startsWith('/clients')) return 'clients'
  return 'idle'
}
