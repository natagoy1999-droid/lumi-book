function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Frantic switching / scroll churn → quieter assistant & glass (pairs with stress).
 */
export function computeInterruptionIntensity(navBurst: number, scrollEwma: number): number {
  const burst = clamp(navBurst / 8, 0, 1)
  const scroll = clamp((scrollEwma - 70) / 2400, 0, 1)
  return clamp(burst * 0.58 + scroll * 0.42, 0, 1)
}
