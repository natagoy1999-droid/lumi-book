function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type LivingGlassInput = {
  ambientPresence: number
  materialStillness: number
  strainBlend: number
}

/**
 * Living glass multiplier — micro breathing allowance; invisible when stillness dominates.
 */
export function deriveLivingGlass(input: LivingGlassInput): number {
  const life =
    0.52 +
    input.ambientPresence * 0.38 -
    input.materialStillness * 0.44 -
    input.strainBlend * 0.14
  return clamp(life, 0.34, 1)
}
