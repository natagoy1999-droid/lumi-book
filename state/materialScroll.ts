import { create } from 'zustand'

type MaterialScrollState = {
  scrollY: number
  setScrollY: (y: number) => void
}

export const useMaterialScroll = create<MaterialScrollState>((set) => ({
  scrollY: 0,
  setScrollY: (y) => set({ scrollY: y }),
}))
