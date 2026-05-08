import type { SentMessage } from '../state/messaging'

export type MessagingProvider = {
  send: (args: { to: string; channel: 'sms' | 'whatsapp' | 'max'; text: string }) => Promise<SentMessage>
}

export class MockMessagingProvider implements MessagingProvider {
  private persist: (msg: SentMessage) => void
  private makeId: () => string

  constructor(opts: { persist: (msg: SentMessage) => void; makeId: () => string }) {
    this.persist = opts.persist
    this.makeId = opts.makeId
  }

  async send(args: { to: string; channel: 'sms' | 'whatsapp' | 'max'; text: string }) {
    const now = Date.now()
    const msg: SentMessage = {
      id: this.makeId(),
      kind: 'followup',
      clientId: 'unknown',
      channel: args.channel,
      title: 'Сообщение',
      text: args.text,
      createdAt: now,
      sentAt: now,
      meta: { to: args.to },
    }
    this.persist(msg)
    return msg
  }
}

// TODO: SupabaseMessagingProvider
// - write message rows to Supabase
// - integrate with real SMS/WhatsApp gateway later
// - keep mock-send behavior in demo

