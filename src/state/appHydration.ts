import { create } from 'zustand'

type AppHydrationState = {
  ready: boolean
  setReady: (ready: boolean) => void
}

export const useAppHydration = create<AppHydrationState>((set) => ({
  ready: false,
  setReady: (ready) => set({ ready }),
}))

