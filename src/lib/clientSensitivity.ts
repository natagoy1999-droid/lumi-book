import type { Booking } from '../state/store'
import type { Client } from '../state/store'
import type { SentMessage } from '../state/messaging'

import { computeClientAIProfile } from './clientAIProfile'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * How much the client base needs softer communication — advisory aggregate only.
 */
export function deriveAggregateClientSensitivity(args: {
  clients: Client[]
  bookings: Booking[]
  sent: SentMessage[]
}): number {
  const { clients, bookings, sent } = args
  if (!clients.length) return 0.35

  let acc = 0
  for (const c of clients) {
    const p = computeClientAIProfile({ client: c, bookings, sent })
    let s = 0.22
    if (p.cancelRisk === 'high') s += 0.38
    else if (p.cancelRisk === 'medium') s += 0.18
    if (p.responsiveness === 'unknown') s += 0.14
    if ((p.daysSinceLast ?? 0) >= 40) s += 0.12
    if (p.returnLikelihood === 'low') s += 0.1
    acc += clamp(s, 0, 1)
  }

  return clamp(acc / clients.length, 0, 1)
}
