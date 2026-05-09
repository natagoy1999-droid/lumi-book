import { create } from 'zustand'

export type ModalId =
  | 'none'
  | 'settings'
  | 'composer'
  | 'walkthrough'
  | 'install'
  | 'pricing_confirm'
  | 'pricing_success'

type ModalState = {
  active: ModalId
  openedAt: number | null
  open: (id: ModalId) => void
  close: () => void
}

export const useModalManager = create<ModalState>((set) => ({
  active: 'none',
  openedAt: null,
  open: (id) => set({ active: id, openedAt: Date.now() }),
  close: () => set({ active: 'none', openedAt: null }),
}))

