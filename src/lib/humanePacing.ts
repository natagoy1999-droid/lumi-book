function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type HumanePacingInput = {
  cognitiveLoad: number
  fatigueLevel: number
  chaoticBurst: number
  /** High cognitive demand — never “rush” the interface even if load is computed high */
  humaneFloor: number
}

/**
 * Humane pacing 0..1 — higher means UI should ease transitions and avoid hurry (no copy layer).
 */
export function deriveHumanePacing(input: HumanePacingInput): number {
  const x =
    input.cognitiveLoad * 0.38 +
    input.fatigueLevel * 0.34 +
    input.chaoticBurst * 0.22 +
    input.humaneFloor * 0.06
  return clamp(x, 0, 1)
}
