import { create } from 'zustand'

export type CommunicationCalmSnapshot = {
  communicationCalm: number
  advisoryDelicacy: number
  socialQuietness: number
  relationshipSoftness: number
  clientCardCalm: number
}

export const useCommunicationCalmIntel = create<{
  snapshot: CommunicationCalmSnapshot | null
  setSnapshot: (s: CommunicationCalmSnapshot | null) => void
}>((set) => ({
  snapshot: null,
  setSnapshot: (s) => set({ snapshot: s }),
}))
