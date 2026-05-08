import type { BehavioralSnapshot } from '../state/behavioralIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type ConfidenceSignals = {
  behavioral: BehavioralSnapshot
  cognitiveLoad: number
  trustSuppression: number
}

/**
 * Unified calm AI confidence — gates hints, dock lift, and readiness without autonomy.
 */
export function computeUnifiedAIConfidence(s: ConfidenceSignals): number {
  const b = s.behavioral
  const calmBias = 1 - clamp(s.cognitiveLoad, 0, 1) * 0.22

  let raw =
    b.habitConfidence * 0.34 +
    b.routeConfidence * 0.28 +
    b.predictiveFocus * 0.22 +
    b.anticipationLevel * 0.16

  raw *= calmBias
  raw *= 1 - clamp(s.trustSuppression, 0, 1) * 0.58

  return clamp(raw, 0, 1)
}

/** Scales habit-aware dock boosts — never zeroes urgency, caps lift when trust is low. */
export function dockBoostTrustMultiplier(aiConfidence: number): number {
  return clamp(0.72 + aiConfidence * 0.28, 0.72, 1)
}

/** Gates behavioral readiness passed to layout — low confidence → почти без предиктивного «раздувания». */
export function gatedBehavioralReadiness(readiness: number, aiConfidence: number): number {
  return clamp(readiness * clamp(0.42 + aiConfidence * 0.58, 0.35, 1), 0, 1)
}
