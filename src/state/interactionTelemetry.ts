import { create } from 'zustand'

function nowMs() {
  return Date.now()
}

const MAX_EVENTS = 72
const EVENT_PRUNE_MS = 92_000

function pruneEvents(ts: number[]): number[] {
  const t = nowMs()
  return ts.filter((x) => t - x <= EVENT_PRUNE_MS).slice(-MAX_EVENTS)
}

type TelemetryStore = {
  scrollEwma: number
  lastScrollY: number
  lastScrollTs: number
  /** Throttled scroll marks as interaction samples */
  lastScrollSampleTs: number
  navBurst: number
  lastNavTs: number
  lastPathname: string
  composerOpens: number[]
  /** Open + close timestamps for composer churn detection */
  composerToggleTimestampsMs: number[]
  eventTimestampsMs: number[]
  lastInteractionTs: number
  typingIntervalsEwmaMs: number
  lastTypingTs: number
  sampleScroll: (y: number) => void
  recordNavigation: (pathname: string) => void
  recordComposerOpened: () => void
  recordComposerClosed: () => void
  recordTypingPulse: () => void
  recordInteractionPulse: () => void
  decayPipeline: () => void
}

/** Passive signals — informs adaptive calm UI only. */
export const useInteractionTelemetry = create<TelemetryStore>((set, get) => ({
  scrollEwma: 0,
  lastScrollY: 0,
  lastScrollTs: nowMs(),
  lastScrollSampleTs: 0,
  navBurst: 0,
  lastNavTs: 0,
  lastPathname: '',
  composerOpens: [],
  composerToggleTimestampsMs: [],
  eventTimestampsMs: [],
  lastInteractionTs: nowMs(),
  typingIntervalsEwmaMs: 520,
  lastTypingTs: 0,

  recordInteractionPulse: () => {
    const t = nowMs()
    set((s) => ({
      lastInteractionTs: t,
      eventTimestampsMs: pruneEvents([...s.eventTimestampsMs, t]),
    }))
  },

  recordTypingPulse: () => {
    const t = nowMs()
    const s = get()
    const dt = s.lastTypingTs ? Math.max(40, t - s.lastTypingTs) : 520
    const typingIntervalsEwmaMs = s.lastTypingTs ? s.typingIntervalsEwmaMs * 0.82 + dt * 0.18 : dt
    set({
      lastTypingTs: t,
      typingIntervalsEwmaMs,
      lastInteractionTs: t,
      eventTimestampsMs: pruneEvents([...s.eventTimestampsMs, t]),
    })
  },

  sampleScroll: (y) => {
    const s = get()
    const t = nowMs()
    const dt = Math.max(32, t - s.lastScrollTs)
    const dv = Math.abs(y - s.lastScrollY)
    const inst = (dv / dt) * 1000
    const scrollEwma = s.scrollEwma * 0.82 + inst * 0.18

    let eventTimestampsMs = s.eventTimestampsMs
    let lastScrollSampleTs = s.lastScrollSampleTs
    if (t - lastScrollSampleTs > 140) {
      lastScrollSampleTs = t
      eventTimestampsMs = pruneEvents([...eventTimestampsMs, t])
    }

    set({
      scrollEwma,
      lastScrollY: y,
      lastScrollTs: t,
      lastScrollSampleTs,
      eventTimestampsMs,
      lastInteractionTs: t,
    })
  },

  recordNavigation: (pathname) => {
    const s = get()
    const t = nowMs()
    let navBurst = s.navBurst * 0.92
    if (pathname !== s.lastPathname) {
      if (t - s.lastNavTs < 2800) navBurst += 1
      else navBurst *= 0.75
    }
    set({
      navBurst: Math.min(navBurst, 8),
      lastNavTs: t,
      lastPathname: pathname,
      lastInteractionTs: t,
      eventTimestampsMs: pruneEvents([...s.eventTimestampsMs, t]),
    })
  },

  recordComposerOpened: () => {
    const s = get()
    const t = nowMs()
    const composerOpens = [...s.composerOpens.filter((x) => t - x < 55_000), t].slice(-14)
    const composerToggleTimestampsMs = pruneEvents([...s.composerToggleTimestampsMs, t])
    set({
      composerOpens,
      composerToggleTimestampsMs,
      lastInteractionTs: t,
      eventTimestampsMs: pruneEvents([...s.eventTimestampsMs, t]),
    })
  },

  recordComposerClosed: () => {
    const s = get()
    const t = nowMs()
    set({
      composerToggleTimestampsMs: pruneEvents([...s.composerToggleTimestampsMs, t]),
      lastInteractionTs: t,
      eventTimestampsMs: pruneEvents([...s.eventTimestampsMs, t]),
    })
  },

  decayPipeline: () => {
    const s = get()
    set({
      scrollEwma: s.scrollEwma * 0.992,
      navBurst: Math.max(0, s.navBurst * 0.985),
      eventTimestampsMs: pruneEvents(s.eventTimestampsMs),
    })
  },
}))
