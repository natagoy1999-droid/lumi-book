import { create } from 'zustand'

type Entry = { until?: number }

type AssistantUIState = {
  dismissed: Record<string, Entry>
  dismiss: (id: string, opts?: { ttlMs?: number }) => void
  clearAllExpired: (now: number) => void
}

export const useAssistantUI = create<AssistantUIState>((set, get) => ({
  dismissed: {},
  dismiss: (id, opts) =>
    set((s) => ({
      dismissed: {
        ...s.dismissed,
        [id]: { until: opts?.ttlMs ? Date.now() + opts.ttlMs : undefined },
      },
    })),
  clearAllExpired: (now) => {
    const cur = get().dismissed
    let changed = false
    const next: Record<string, Entry> = {}
    for (const [k, v] of Object.entries(cur)) {
      if (!v.until || v.until > now) next[k] = v
      else changed = true
    }
    if (changed) set({ dismissed: next })
  },
}))

