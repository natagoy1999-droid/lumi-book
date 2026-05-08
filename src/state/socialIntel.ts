import { create } from 'zustand'

export type SocialAwarenessSnapshot = {
  relationshipContinuity: number
  communicationSoftness: number
  socialRhythm: number
  clientSensitivity: number
  followupDelicacy: number
}

export const useSocialIntel = create<{
  snapshot: SocialAwarenessSnapshot | null
  setSnapshot: (s: SocialAwarenessSnapshot | null) => void
}>((set) => ({
  snapshot: null,
  setSnapshot: (s) => set({ snapshot: s }),
}))
