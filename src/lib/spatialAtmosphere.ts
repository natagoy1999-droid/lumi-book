function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type SpatialQuietnessInput = {
  cognitiveLoad: number
  stressPressure: number
  fatigueLevel: number
  energyQuietness: number
  strainBlend: number
}

/**
 * Atmospheric simplification — softer hierarchy, less chrome sparkle under strain (scalar only).
 */
export function deriveSpatialQuietness(input: SpatialQuietnessInput): number {
  const q =
    input.cognitiveLoad * 0.2 +
    input.stressPressure * 0.26 +
    input.fatigueLevel * 0.22 +
    input.energyQuietness * 0.22 +
    input.strainBlend * 0.18
  return clamp(q, 0, 1)
}

export type EnvironmentSoftnessBlendInput = {
  /** From circadian light layer — baseline spatial softness */
  baseSoftness: number
  ambientPresence: number
  strainBlend: number
  workflowCalm: number
}

/** Final softness — one coherent room, not a page-by-page gloss switch. */
export function blendEnvironmentSoftness(input: EnvironmentSoftnessBlendInput): number {
  const { baseSoftness, ambientPresence, strainBlend, workflowCalm } = input
  return clamp(
    baseSoftness * (0.86 + ambientPresence * 0.16) + strainBlend * 0.07 - workflowCalm * 0.035,
    0.16,
    0.84,
  )
}
