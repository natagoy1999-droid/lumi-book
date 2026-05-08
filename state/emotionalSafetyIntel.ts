import { create } from 'zustand'

import type { EmotionalSafetyBundle } from '../lib/emotionalSafety'

export const useEmotionalSafetyIntel = create<{
  bundle: EmotionalSafetyBundle | null
  setBundle: (b: EmotionalSafetyBundle | null) => void
}>((set) => ({
  bundle: null,
  setBundle: (b) => set({ bundle: b }),
}))
