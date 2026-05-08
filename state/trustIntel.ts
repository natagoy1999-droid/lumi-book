import { create } from 'zustand'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

const WINDOW_MS = 96 * 60 * 60 * 1000

/**
 * Local trust rhythm — user dismissed proactive hints → assistant quiets (no cloud).
 */
export const useTrustIntel = create<{
  whisperDismissTs: number[]
  lastAIConfidence: number
  lastDockBoostMul: number
  lastAnticipationQuietness: number
  recordPredictionDismiss: () => void
  pruneOld: (now: number) => void
  trustSuppression: () => number
  setTrustOutputs: (p: { ai: number; dockMul: number; anticipationQuiet: number }) => void
}>((set, get) => ({
  whisperDismissTs: [],
  lastAIConfidence: 0.32,
  lastDockBoostMul: 1,
  lastAnticipationQuietness: 0.22,

  recordPredictionDismiss: () => {
    const t = Date.now()
    set({
      whisperDismissTs: [...get().whisperDismissTs.filter((x) => t - x < WINDOW_MS), t].slice(-24),
    })
  },

  pruneOld: (now) => {
    const next = get().whisperDismissTs.filter((x) => now - x < WINDOW_MS)
    if (next.length !== get().whisperDismissTs.length) set({ whisperDismissTs: next })
  },

  trustSuppression: () => {
    const ts = get().whisperDismissTs
    const now = Date.now()
    const recent = ts.filter((x) => now - x < 36 * 60 * 60 * 1000)
    if (recent.length === 0) return 0
    let w = 0
    for (const t of recent) {
      const ageH = (now - t) / (60 * 60 * 1000)
      w += Math.exp(-ageH / 14)
    }
    return clamp(1 - Math.exp(-w * 0.42), 0, 0.94)
  },

  setTrustOutputs: (p) =>
    set({
      lastAIConfidence: p.ai,
      lastDockBoostMul: p.dockMul,
      lastAnticipationQuietness: p.anticipationQuiet,
    }),
}))
