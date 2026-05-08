import { create } from 'zustand'

export type FlowStateBundle = {
  flowMomentum: number
  focusContinuity: number
  interactionFlow: number
  workflowCalm: number
  momentumProtection: number
  frictionReduction: number
}

export const useFlowIntel = create<{
  bundle: FlowStateBundle | null
  setBundle: (b: FlowStateBundle | null) => void
}>((set) => ({
  bundle: null,
  setBundle: (b) => set({ bundle: b }),
}))
