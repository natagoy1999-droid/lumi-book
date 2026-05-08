function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Friction reduction factor — suppresses decorative weight without “productivity mode”.
 */
export function computeFrictionReduction(flowMomentum: number, focusContinuity: number): number {
  return clamp(0.35 + flowMomentum * 0.38 + focusContinuity * 0.22, 0, 1)
}
