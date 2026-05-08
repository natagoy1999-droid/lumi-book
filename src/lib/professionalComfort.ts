/**
 * Professional comfort — tiny reversible blends; no abrupt UX jumps.
 */

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Smaller steps when inferred preference drifts far from stored (ambiguous signals). */
export function conflictDampening(delta: number, threshold = 0.38): number {
  const d = Math.abs(delta)
  if (d < threshold) return 1
  return clamp(1 - (d - threshold) / (1 - threshold), 0.35, 1)
}

/** Cross-axis tension: simultaneous drive toward high calm + high density — weaken inference. */
export function crossAxisConflict(calmness: number, density: number): number {
  if (calmness > 0.62 && density > 0.62) return 0.42
  return 1
}

/**
 * Long-horizon learning rate — starts tiny; grows slightly as familiarity builds.
 */
export function comfortLearningAlpha(args: {
  familiarity: number
  conflict: number
  crossConflict: number
}): number {
  const base = 0.0028
  const famBoost = 1 + args.familiarity * 0.55
  return base * famBoost * args.conflict * args.crossConflict
}

/** Blend current CSS token toward preferred, capped per frame (stability). */
export function blendTokenTowardPreferred(args: {
  current: number
  preferred: number
  familiarity: number
  maxStep: number
}): number {
  const target = lerp(args.current, args.preferred, clamp(args.familiarity * 0.85, 0, 1))
  const delta = clamp(target - args.current, -args.maxStep, args.maxStep)
  return clamp(args.current + delta, 0, 1)
}
