import { create } from 'zustand'

export type TemporalIntelSnapshot = {
  timingReadiness: number
  interactionTiming: number
  pauseSoftness: number
  temporalQuietness: number
  assistanceWindow: number
  proactiveSuppression: number
}

export const useTemporalIntel = create<{
  snapshot: TemporalIntelSnapshot | null
  setSnapshot: (s: TemporalIntelSnapshot | null) => void
}>((set) => ({
  snapshot: null,
  setSnapshot: (s) => set({ snapshot: s }),
}))
