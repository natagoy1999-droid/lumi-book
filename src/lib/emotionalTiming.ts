import type { CircadianPhase } from './dayRhythm'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type EmotionalTimingLayer = {
  /** Fine multiplier blended into --ambient-rhythm */
  rhythmEase: number
  /** Small additive to motion quietness (never harsh) */
  motionQuietNudge: number
}

/**
 * Emotional rhythm micro-layer — almost invisible shifts, not “modes”.
 */
export function computeEmotionalTiming(
  weights: Record<CircadianPhase, number>,
  args: { busyEveningPull: number },
): EmotionalTimingLayer {
  const lf = weights.late_focus
  const ev = weights.evening
  const m = weights.morning

  const rhythmEase = clamp(
    1 + m * 0.035 - lf * 0.055 - ev * 0.02 - args.busyEveningPull * 0.025,
    0.9,
    1.06,
  )

  const motionQuietNudge = clamp(
    lf * 0.055 + ev * 0.025 - m * 0.015 - args.busyEveningPull * 0.03,
    -0.02,
    0.09,
  )

  return { rhythmEase, motionQuietNudge }
}
