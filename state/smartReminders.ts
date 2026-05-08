import { create } from 'zustand'

type DismissEntry = { until?: number }

type SmartReminderUIStore = {
  dismissed: Record<string, DismissEntry>
  dismiss: (id: string, opts?: { ttlMs?: number }) => void
  clear: (id: string) => void
  clearAllExpired: (now: number) => void
}

export const useSmartReminderUI = create<SmartReminderUIStore>((set, get) => ({
  dismissed: {},
  dismiss: (id, opts) =>
    set((s) => ({
      dismissed: {
        ...s.dismissed,
        [id]: { until: opts?.ttlMs ? Date.now() + opts.ttlMs : undefined },
      },
    })),
  clear: (id) =>
    set((s) => {
      const next = { ...s.dismissed }
      delete next[id]
      return { dismissed: next }
    }),
  clearAllExpired: (now) => {
    const cur = get().dismissed
    let changed = false
    const next: Record<string, DismissEntry> = {}
    for (const [k, v] of Object.entries(cur)) {
      if (!v.until || v.until > now) next[k] = v
      else changed = true
    }
    if (changed) set({ dismissed: next })
  },
}))

