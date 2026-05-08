import { create } from 'zustand'

export type PredictiveCalmSnapshot = {
  predictiveReadiness: number
  preparedFlow: number
  frictionEvaporation: number
  calmAcceleration: number
  workflowReadiness: number
}

export const usePredictiveIntel = create<{
  snapshot: PredictiveCalmSnapshot | null
  composerAmbientHint: { line: string } | null
  setPredictive: (snapshot: PredictiveCalmSnapshot, hint: { line: string } | null) => void
}>((set) => ({
  snapshot: null,
  composerAmbientHint: null,
  setPredictive: (snapshot, composerAmbientHint) => set({ snapshot, composerAmbientHint }),
}))
