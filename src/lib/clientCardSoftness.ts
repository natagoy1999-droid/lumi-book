import type { SentMessage } from '../state/messaging'
import type { Booking, Client } from '../state/store'

import { computeClientAIProfile, type ClientAIProfile } from './clientAIProfile'
import { computeClientInsights } from './clientInsights'
import { dismissLaterHint } from './humaneWording'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function sensitivityFromProfile(p: ClientAIProfile): number {
  let s = 0.2
  if (p.cancelRisk === 'high') s += 0.35
  else if (p.cancelRisk === 'medium') s += 0.15
  if (p.responsiveness === 'unknown') s += 0.12
  if ((p.daysSinceLast ?? 0) >= 45) s += 0.18
  if (p.returnLikelihood === 'low') s += 0.12
  return clamp(s, 0, 1)
}

export type ClientCardSurface = {
  /** Softer insight line for the AI block */
  insightLine: string
  /** Optional gentle hint — no aggressive CTA */
  quietHint?: string
  /** 0–1 — stronger calm UI when higher */
  calm: number
  /** When true, avoid pushy “write now” framing in surrounding UI */
  preferQuietFollowUp: boolean
}

/**
 * Per-client card softness — relationship-aware, not lead scoring.
 */
export function deriveClientCardSurface(args: {
  client: Client
  bookings: Booking[]
  sent: SentMessage[]
  socialQuietness: number
}): ClientCardSurface {
  const profile = computeClientAIProfile({
    client: args.client,
    bookings: args.bookings,
    sent: args.sent,
  })
  const insights = computeClientInsights(args.bookings, args.client.id)
  const sens = sensitivityFromProfile(profile)
  const quiet = clamp(0.45 * args.socialQuietness + 0.55 * sens, 0, 1)

  const days = profile.daysSinceLast ?? 0
  const longSilence = days >= 32
  const delicate = longSilence && sens > 0.48

  let insightLine = insights.label
  if (quiet > 0.62 && insights.likelihood === 'low') {
    insightLine = insightLine.replace(
      'Низкая вероятность повторной записи',
      'Ритм общения спокойный — без обязательств с вашей стороны',
    )
  }

  const preferQuietFollowUp = delicate || (longSilence && sens > 0.55)

  return {
    insightLine,
    quietHint: preferQuietFollowUp ? dismissLaterHint(args.socialQuietness) : undefined,
    calm: clamp(0.35 + quiet * 0.45 + (1 - sens) * 0.12, 0, 1),
    preferQuietFollowUp,
  }
}
