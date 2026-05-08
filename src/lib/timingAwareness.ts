function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type TimingAwarenessInput = {
  navBurst: number
  scrollEwma: number
  flowMomentum: number
  interactionFlow: number
  cognitiveLoad: number
}

/** Rhythm quality for orchestration — higher means calmer interaction tempo. */
export function deriveInteractionTimingQuality(input: TimingAwarenessInput): number {
  const churn =
    clamp(input.navBurst / 8.4, 0, 1) * 0.42 + clamp((input.scrollEwma - 65) / 2600, 0, 1) * 0.34
  const flowEase =
    input.flowMomentum * 0.14 + input.interactionFlow * 0.26 + (1 - input.cognitiveLoad) * 0.22
  return clamp(flowEase * (1 - churn * 0.62) + 0.08, 0, 1)
}

export type UrgencyProximityInput = {
  dominantScore: number
  minutesToNext?: number
}

/** Near-term operational pressure — tighter moments defer assistance surfaces. */
export function deriveUrgencyProximity(input: UrgencyProximityInput): number {
  let u = clamp((input.dominantScore - 54) / 46, 0, 1) * 0.52
  if (typeof input.minutesToNext === 'number') {
    if (input.minutesToNext <= 22) u += 0.38
    else if (input.minutesToNext <= 40) u += 0.22
    else if (input.minutesToNext <= 65) u += 0.12
  }
  return clamp(u, 0, 1)
}
