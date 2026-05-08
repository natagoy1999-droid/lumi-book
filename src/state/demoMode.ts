import { create } from 'zustand'

export type DemoStep =
  | 'intro'
  | 'create_booking'
  | 'reschedule'
  | 'smart_reminder'
  | 'assistant'
  | 'analytics'
  | 'followup'
  | 'done'

type DemoModeState = {
  active: boolean
  step: DemoStep
  startedAt: number | null
  start: () => void
  stop: () => void
  go: (step: DemoStep) => void
  prev: () => void
  next: () => void
}

const order: DemoStep[] = [
  'intro',
  'create_booking',
  'reschedule',
  'smart_reminder',
  'assistant',
  'analytics',
  'followup',
  'done',
]

export const useDemoMode = create<DemoModeState>((set, get) => ({
  active: false,
  step: 'intro',
  startedAt: null,
  start: () => set({ active: true, step: 'intro', startedAt: Date.now() }),
  stop: () => set({ active: false, step: 'intro', startedAt: null }),
  go: (step) => set({ active: true, step }),
  prev: () => {
    const s = get().step
    const idx = order.indexOf(s)
    const prev = order[Math.max(0, Math.min(order.length - 1, idx - 1))]
    set({ active: true, step: prev })
  },
  next: () => {
    const s = get().step
    const idx = order.indexOf(s)
    const next = order[Math.max(0, Math.min(order.length - 1, idx + 1))]
    set({ active: true, step: next })
  },
}))

