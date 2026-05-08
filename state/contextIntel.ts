import { create } from 'zustand'

import type { ContextMemoryDerived } from '../lib/contextMemory'

export const useContextIntel = create<{
  derived: ContextMemoryDerived | null
  setDerived: (d: ContextMemoryDerived | null) => void
}>((set) => ({
  derived: null,
  setDerived: (d) => set({ derived: d }),
}))
