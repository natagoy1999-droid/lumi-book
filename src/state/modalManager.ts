import { create } from 'zustand'

export type ModalId =
  | 'none'
  | 'settings'
  | 'composer'
  | 'client'
  | 'walkthrough'
  | 'install'
  | 'pricing_confirm'
  | 'pricing_success'

const KNOWN: ModalId[] = [
  'none',
  'settings',
  'composer',
  'client',
  'walkthrough',
  'install',
  'pricing_confirm',
  'pricing_success',
]

const KNOWN_SET = new Set<ModalId>(KNOWN)

/** Safe for Sheet / overlays when `modalId` might be stale or forged. */
export function coerceModalId(id: unknown): ModalId {
  if (typeof id === 'string' && KNOWN_SET.has(id as ModalId)) return id as ModalId
  return 'settings'
}

type ModalState = {
  active: ModalId
  openedAt: number | null
  open: (id: ModalId) => void
  close: () => void
}

export const useModalManager = create<ModalState>((set) => ({
  active: 'none',
  openedAt: null,
  open: (id) => {
    if (!KNOWN_SET.has(id)) {
      console.warn('[modalManager] invalid modal id, closing:', id)
      set({ active: 'none', openedAt: null })
      return
    }
    set({ active: id, openedAt: Date.now() })
  },
  close: () => set({ active: 'none', openedAt: null }),
}))
