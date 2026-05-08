import { create } from 'zustand'

/** Passive rhythm / pacing signals — no mood labels, advisory-only. */
export type EnergyDerivedSnapshot = {
  interactionEnergy: number
  fatigueLevel: number
  humanePacing: number
  energyQuietness: number
  focusRecovery: number
}

export const useEnergyIntel = create<{
  snapshot: EnergyDerivedSnapshot | null
  setSnapshot: (s: EnergyDerivedSnapshot | null) => void
}>((set) => ({
  snapshot: null,
  setSnapshot: (s) => set({ snapshot: s }),
}))
