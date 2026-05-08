import { create } from 'zustand'

export type RecoveryScenario =
  | 'no_response'
  | 'cancel'
  | 'inactive'
  | 'first_visit'
  | 'reschedule'

export type RecoveryStepKind =
  | 'reminder_1'
  | 'reminder_2'
  | 'offer_new_time'
  | 'special_offer'
  | 'soft_stop'

export type RecoveryStep = {
  id: string
  kind: RecoveryStepKind
  scheduledAt: number
  doneAt?: number
}

export type RecoveryChainStatus = 'active' | 'paused' | 'completed' | 'stopped'

export type RecoveryChain = {
  id: string
  scenario: RecoveryScenario
  clientId: string
  bookingId?: string
  createdAt: number
  status: RecoveryChainStatus
  steps: RecoveryStep[]
  note?: string
  score: number
}

type RecoveryState = {
  chains: RecoveryChain[]
  ensureChain: (chain: RecoveryChain) => void
  completeStep: (chainId: string, stepId: string, at: number) => void
  stopChain: (chainId: string, at: number) => void
  completeChain: (chainId: string, at: number) => void
  tick: (now: number) => void
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function makeStep(kind: RecoveryStepKind, scheduledAt: number): RecoveryStep {
  return { id: uid('step'), kind, scheduledAt }
}

export const useRecovery = create<RecoveryState>((set, get) => ({
  chains: [],

  ensureChain: (chain) =>
    set((s) => {
      const exists = s.chains.some((c) => c.id === chain.id)
      if (exists) return s
      return { chains: [chain, ...s.chains].slice(0, 50) }
    }),

  completeStep: (chainId, stepId, at) =>
    set((s) => ({
      chains: s.chains.map((c) =>
        c.id !== chainId
          ? c
          : {
              ...c,
              steps: c.steps.map((st) => (st.id === stepId ? { ...st, doneAt: at } : st)),
            },
      ),
    })),

  stopChain: (chainId) =>
    set((s) => ({
      chains: s.chains.map((c) => (c.id === chainId ? { ...c, status: 'stopped' } : c)),
    })),

  completeChain: (chainId) =>
    set((s) => ({
      chains: s.chains.map((c) => (c.id === chainId ? { ...c, status: 'completed' } : c)),
    })),

  tick: (now) => {
    // Lightweight: auto-complete chains whose actionable steps are all done.
    const { chains } = get()
    let changed = false
    const next = chains.map((c) => {
      if (c.status !== 'active') return c
      const actionable = c.steps.filter((st) => st.kind !== 'soft_stop')
      const allDone = actionable.length > 0 && actionable.every((st) => st.doneAt)
      if (allDone) {
        changed = true
        return { ...c, status: 'completed' as const }
      }
      // Auto-stop if last step is soft_stop and it is past schedule.
      const last = c.steps[c.steps.length - 1]
      if (last?.kind === 'soft_stop' && now >= last.scheduledAt) {
        changed = true
        return { ...c, status: 'stopped' as const }
      }
      return c
    })
    if (changed) set({ chains: next })
  },
}))

