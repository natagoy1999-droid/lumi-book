function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type AmbientLightingInput = {
  environmentSoftness: number
  lightDiffusion: number
  surfaceIllumination: number
}

/**
 * Tiered illumination + material response to ambient light (depth falloff, clarity).
 */
export function applyAmbientLighting(
  light: AmbientLightingInput,
  ctx: { attentionLock: number },
) {
  const root = document.documentElement
  const lock = clamp(ctx.attentionLock, 0, 1)
  const soft = clamp(light.environmentSoftness, 0, 1)
  const diff = clamp(light.lightDiffusion, 0, 1)
  const illum = clamp(light.surfaceIllumination, 0, 1.15)

  // Dominant surfaces read slightly clearer; secondary receives gentler ambient fill.
  const falloff = clamp(0.07 + soft * 0.06 + diff * 0.05 + lock * -0.02, 0.04, 0.18)
  const focusTier = clamp(illum * (1 + (1 - diff) * 0.045 + lock * 0.05), 0.88, 1.12)
  const interactiveTier = clamp(focusTier * (1 - falloff * 0.55), 0.78, 1.02)
  const ambientTier = clamp(interactiveTier * (1 - falloff * 0.42), 0.68, 0.96)

  root.style.setProperty('--illumination-focus-mul', focusTier.toFixed(3))
  root.style.setProperty('--illumination-secondary-mul', interactiveTier.toFixed(3))
  root.style.setProperty('--illumination-ambient-mul', ambientTier.toFixed(3))

  const edgeClarity = clamp(
    1 + (1 - diff) * 0.065 + lock * 0.055 - soft * 0.035,
    0.94,
    1.1,
  )
  root.style.setProperty('--light-edge-clarity', edgeClarity.toFixed(3))

  const frostAmbient = clamp(0.94 + soft * 0.09 - lock * 0.06 + diff * 0.04, 0.86, 1.08)
  root.style.setProperty('--frost-ambient-mul', frostAmbient.toFixed(3))
}
