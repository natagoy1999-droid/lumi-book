import { create } from 'zustand'

export type RouteTransition = {
  from: string
  to: string
  ts: number
}

export type BehavioralSnapshot = {
  habitConfidence: number
  predictiveFocus: number
  behavioralReadiness: number
  anticipationLevel: number
  routeConfidence: number
  suggestedNextPath: string | null
}

/**
 * Passive habit graph — route continuity + composer rhythm (no cloud, no PII upload).
 */
export const useBehavioralIntel = create<{
  transitions: RouteTransition[]
  composerOpens: number[]
  lastSnapshot: BehavioralSnapshot | null
  recordTransition: (from: string, to: string) => void
  recordComposerOpen: () => void
  setLastSnapshot: (s: BehavioralSnapshot) => void
}>((set, get) => ({
  transitions: [],
  composerOpens: [],
  lastSnapshot: null,

  recordTransition: (from, to) => {
    if (!to || from === to) return
    const ts = Date.now()
    const normFrom = from.length ? from : '/today'
    set({
      transitions: [...get().transitions, { from: normFrom, to, ts }].slice(-140),
    })
  },

  recordComposerOpen: () => {
    const t = Date.now()
    set({
      composerOpens: [...get().composerOpens.filter((x) => t - x < 72 * 60 * 60 * 1000), t].slice(-48),
    })
  },

  setLastSnapshot: (s) => set({ lastSnapshot: s }),
}))
