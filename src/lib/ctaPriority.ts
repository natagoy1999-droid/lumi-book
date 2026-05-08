export type CTASignal =
  | { kind: 'pending_confirm'; minutesTo?: number; price?: number }
  | { kind: 'slot_freed'; minutesTo?: number; premium?: boolean }
  | { kind: 'inactive'; daysSinceLast: number; ltv: number; likelihood: 'high' | 'medium' | 'low' }
  | { kind: 'reschedule_pending'; ageHours: number; price?: number }

export function scoreCTA(signal: CTASignal) {
  let score = 0

  // urgency
  if ('minutesTo' in signal && typeof signal.minutesTo === 'number') {
    if (signal.minutesTo <= 60) score += 50
    else if (signal.minutesTo <= 180) score += 28
    else score += 12
  }

  // revenue / value
  if ('price' in signal && typeof signal.price === 'number') score += Math.min(22, signal.price / 200)
  if ('ltv' in signal) score += Math.min(28, signal.ltv / 1000)

  // scenario boosts
  if (signal.kind === 'pending_confirm') score += 18
  if (signal.kind === 'reschedule_pending') score += signal.ageHours >= 24 ? 26 : signal.ageHours >= 3 ? 18 : 10
  if (signal.kind === 'slot_freed') score += signal.premium ? 22 : 14
  if (signal.kind === 'inactive') {
    score += signal.daysSinceLast >= 42 ? 24 : 14
    score += signal.likelihood === 'high' ? 14 : signal.likelihood === 'medium' ? 9 : 5
  }

  return Math.round(score)
}

