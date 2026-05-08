import { create } from 'zustand'

type AppHydrationState = {
  ready: boolean
  firstPaintDone: boolean
  setReady: (ready: boolean) => void
  setFirstPaintDone: (done: boolean) => void
}

export const useAppHydration = create<AppHydrationState>((set) => ({
  ready: false,
  firstPaintDone: false,
  setReady: (ready) => set({ ready }),
  setFirstPaintDone: (done) => set({ firstPaintDone: done }),
}))

