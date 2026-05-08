import type { RouteTransition } from '../state/behavioralIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/** Recent route churn — same continuous space feeling disrupted when navigation spikes. */
export function computeTransitionChurn(transitions: readonly RouteTransition[], nowMs: number): number {
  const recent = transitions.filter((t) => nowMs - t.ts < 88_000).length
  return clamp((recent - 2) / 11, 0, 1)
}

export type EnvironmentalContinuityInput = {
  navBurst: number
  transitionChurn: number
}

/**
 * Continuity bias 0..1 — stabilizes atmosphere after chaotic movement (no messaging).
 */
export function deriveEnvironmentalContinuity(input: EnvironmentalContinuityInput): number {
  return clamp(input.navBurst / 7.2 * 0.52 + input.transitionChurn * 0.48, 0, 1)
}
