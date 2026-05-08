import { create } from 'zustand'

/** Learned operational atmosphere — local only, no personality framing. */
export type PresencePreferenceSnapshot = {
  preferredCalmness: number
  preferredDensity: number
  preferredSoftness: number
  preferredPacing: number
  assistantQuietAffinity: number
  dockIntensityAffinity: number
  advisoryAffinity: number
  /** Confidence-weighted observation volume — drives familiarity growth */
  observationMass: number
  sampleCount: number
}

export const usePresenceIntel = create<{
  snapshot: PresencePreferenceSnapshot | null
  setSnapshot: (s: PresencePreferenceSnapshot | null) => void
}>((set) => ({
  snapshot: null,
  setSnapshot: (s) => set({ snapshot: s }),
}))
