import type { Booking } from '../state/store'
import type { Client } from '../state/store'
import type { SentMessage } from '../state/messaging'

import { computeClientAIProfile } from './clientAIProfile'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type SocialRhythmAggregateInput = {
  bookings: Booking[]
  clients: Client[]
  sent: SentMessage[]
  pendingConfirm: number
  reschedulePending: number
  remindersCount: number
}

/**
 * Aggregate interaction rhythm — human pacing, not CRM scoring.
 */
export function deriveAggregateSocialRhythm(input: SocialRhythmAggregateInput): number {
  const n = Math.max(1, input.clients.length)
  const backlog = clamp((input.pendingConfirm + input.reschedulePending * 0.85) / 8.5, 0, 1)
  const reminderNoise = clamp(input.remindersCount / 12, 0, 1)

  let repeatWarmth = 0
  for (const c of input.clients) {
    const recent = input.bookings.filter(
      (b) => b.clientId === c.id && b.status !== 'cancelled',
    ).length
    if (recent >= 2) repeatWarmth += 1
  }
  repeatWarmth = clamp(repeatWarmth / n, 0, 1)

  let responsivenessEase = 0
  for (const c of input.clients) {
    const p = computeClientAIProfile({ client: c, bookings: input.bookings, sent: input.sent })
    if (p.responsiveness !== 'unknown') responsivenessEase += 1
    if (p.cancelRisk === 'low') responsivenessEase += 0.35
    else if (p.cancelRisk === 'medium') responsivenessEase += 0.12
  }
  responsivenessEase = clamp(responsivenessEase / (n * 1.35), 0, 1)

  const sentRecent = input.sent.filter((m) => Date.now() - m.sentAt < 14 * 24 * 60 * 60 * 1000).length
  const msgCadence = clamp(sentRecent / Math.max(8, n * 2.2), 0, 1)

  return clamp(
    repeatWarmth * 0.28 +
      responsivenessEase * 0.32 +
      msgCadence * 0.18 +
      (1 - backlog) * 0.34 +
      (1 - reminderNoise) * 0.22 -
      backlog * 0.24,
    0,
    1,
  )
}
