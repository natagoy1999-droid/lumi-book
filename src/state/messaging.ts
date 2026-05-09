import { create } from 'zustand'

export type MessageChannel = 'sms' | 'whatsapp' | 'max'
export type MessageKind =
  | 'reengage'
  | 'slot_offer'
  | 'nudge_confirm'
  | 'reschedule_offer'
  | 'followup'
  | 'special_offer'

export type MessageDraft = {
  id: string
  kind: MessageKind
  clientId: string
  bookingId?: string
  channel: MessageChannel
  title: string
  text: string
  meta?: Record<string, string>
  createdAt: number
}

export type SentMessage = MessageDraft & {
  sentAt: number
}

const STORAGE_KEY = 'lumi_messages_v1'

type PersistShape = {
  v: 1
  sent: SentMessage[]
}

function loadSent(): SentMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      console.warn('[lumi] Removed corrupted messages blob:', STORAGE_KEY)
      return []
    }
    const p = parsed as Partial<PersistShape>
    if (p.v !== 1 || !Array.isArray(p.sent)) return []
    return p.sent.filter(Boolean) as SentMessage[]
  } catch {
    return []
  }
}

function saveSent(sent: SentMessage[]) {
  try {
    const payload: PersistShape = { v: 1, sent }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

type MessagingState = {
  composer:
    | {
        open: true
        draft: MessageDraft
      }
    | {
        open: false
        draft?: MessageDraft
      }
  sent: SentMessage[]
  openComposer: (draft: MessageDraft) => void
  closeComposer: () => void
  setChannel: (channel: MessageChannel) => void
  setText: (text: string) => void
  send: () => void
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export const useMessaging = create<MessagingState>((set, get) => ({
  composer: { open: false },
  sent: loadSent(),

  openComposer: (draft) => set({ composer: { open: true, draft } }),
  closeComposer: () => set({ composer: { open: false } }),

  setChannel: (channel) =>
    set((s) =>
      s.composer.open
        ? { composer: { open: true, draft: { ...s.composer.draft, channel } } }
        : s,
    ),

  setText: (text) =>
    set((s) =>
      s.composer.open
        ? { composer: { open: true, draft: { ...s.composer.draft, text } } }
        : s,
    ),

  send: () => {
    const c = get().composer
    if (!c.open) return
    const draft = c.draft
    const msg: SentMessage = { ...draft, sentAt: Date.now() }
    set((s) => {
      const sent = [msg, ...s.sent].slice(0, 500)
      saveSent(sent)
      return { sent, composer: { open: false } }
    })
  },
}))

