import { create } from 'zustand'

import type { WorkflowIntentModel } from '../lib/workflowIntent'

export const useIntentIntel = create<{
  model: WorkflowIntentModel | null
  setModel: (m: WorkflowIntentModel | null) => void
}>((set) => ({
  model: null,
  setModel: (m) => set({ model: m }),
}))
