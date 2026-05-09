import { create } from 'zustand'

export type CognitiveUIPolicy = {
  /** Blended cognitive pressure 0..1 */
  load: number
  reminderCap: number
  assistantCap: number
  ctasPerReminder: number
  showQuickBar: boolean
  hideSecondaryPinned: boolean
  dockActionsCap: number
  miniWidgetsCompact: boolean
  hideRecoveryWidget: boolean
  hideBusyHeavyBlocks: boolean
  freeSlotChips: number
  /** Layout rebalance — fuller grid rhythm when secondary tiles hide (silent). */
  layoutBalance: number
  rhythmCompression: number
  /** Cross-screen secondary insight surfaces */
  showClientAIInsight: boolean
  analyticsServiceRowsCap: number
  showAmbientHints: boolean
}

const defaultPolicy: CognitiveUIPolicy = {
  load: 0,
  reminderCap: 12,
  assistantCap: 4,
  ctasPerReminder: 4,
  showQuickBar: true,
  hideSecondaryPinned: false,
  dockActionsCap: 2,
  miniWidgetsCompact: false,
  hideRecoveryWidget: false,
  hideBusyHeavyBlocks: false,
  freeSlotChips: 5,
  layoutBalance: 0.26,
  rhythmCompression: 0,
  showClientAIInsight: true,
  analyticsServiceRowsCap: 3,
  showAmbientHints: true,
}

const STORAGE_KEY = 'lumi_settings_v1'
type PersistShape = { v: 1; policy: CognitiveUIPolicy }

function loadPolicy(): CognitiveUIPolicy {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPolicy
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      console.warn('[lumi] Removed corrupted cognitive UI blob:', STORAGE_KEY)
      return defaultPolicy
    }
    const p = parsed as Partial<PersistShape>
    if (p.v !== 1 || !p.policy || typeof p.policy !== 'object') return defaultPolicy
    return { ...defaultPolicy, ...p.policy }
  } catch {
    return defaultPolicy
  }
}

function savePolicy(policy: CognitiveUIPolicy) {
  try {
    const payload: PersistShape = { v: 1, policy }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export const useCognitiveUI = create<{
  policy: CognitiveUIPolicy
  setPolicy: (p: CognitiveUIPolicy) => void
}>((set) => ({
  policy: loadPolicy(),
  setPolicy: (p) =>
    set(() => {
      savePolicy(p)
      return { policy: p }
    }),
}))
