function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Triangle peak at `peak` between `a` and `b`. */
function triPeak(t: number, a: number, peak: number, b: number): number {
  if (t < a || t > b) return 0
  if (t <= peak) return smoothstep(a, peak, t)
  return 1 - smoothstep(peak, b, t)
}

export type CircadianPhase = 'morning' | 'day' | 'evening' | 'late_focus'

/** Decimal local hour [0, 24). */
export function decimalHour(d: Date): number {
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
}

/**
 * Smooth phase weights (sum ≈ 1). Cross-fades are gradual — no hard theme switches.
 */
export function circadianPhaseWeights(d: Date): Record<CircadianPhase, number> {
  const t = decimalHour(d)

  const morning = triPeak(t, 5.25, 8.25, 11.75)
  const day = triPeak(t, 10, 14.25, 18.25)
  const evening = triPeak(t, 16.25, 19.5, 22)
  const lateNight = Math.max(triPeak(t, 21, 23.35, 24), triPeak(t, 0, 1.35, 4.25))

  const rawMorning = morning
  const rawDay = Math.max(0, day - morning * 0.35 - evening * 0.25)
  const rawEvening = Math.max(0, evening - lateNight * 0.45)
  const rawLate = lateNight

  let m = rawMorning
  let dy = rawDay
  let ev = rawEvening
  let lf = rawLate

  const sum = m + dy + ev + lf || 1
  m /= sum
  dy /= sum
  ev /= sum
  lf /= sum

  return {
    morning: m,
    day: dy,
    evening: ev,
    late_focus: lf,
  }
}

/** Soft “openness” bias for morning freshness (0..1). */
export function morningOpenness(weights: Record<CircadianPhase, number>): number {
  return clamp(weights.morning * 0.92 + weights.day * 0.12, 0, 1)
}

/** Softer evening / night ambience bias (0..1). */
export function eveningEase(weights: Record<CircadianPhase, number>): number {
  return clamp(weights.evening * 0.85 + weights.late_focus * 0.95, 0, 1)
}
