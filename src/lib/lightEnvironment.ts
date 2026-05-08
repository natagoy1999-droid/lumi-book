import { applyAmbientLighting } from './ambientLighting'
import { circadianPhaseWeights, eveningEase, morningOpenness } from './dayRhythm'
import { applyMaterialWarmth, computeGlassWarmth } from './materialWarmth'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type LightEnvironmentInput = {
  homeMode: 'calm' | 'busy'
  attentionLock: number
  motionFreeze: number
  pathname: string
  now?: Date
}

export type LightEnvironment = {
  ambientLight: number
  glassWarmth: number
  lightDiffusion: number
  surfaceIllumination: number
  environmentSoftness: number
}

/**
 * Global ambient light environment — contextual, ultra-subtle (no “FX lighting”).
 */
export function computeLightEnvironment(input: LightEnvironmentInput): LightEnvironment {
  const calm = input.homeMode === 'calm'
  const lock = clamp(input.attentionLock, 0, 1)
  const freeze = clamp(input.motionFreeze, 0, 1)
  const w = circadianPhaseWeights(input.now ?? new Date())
  const evening = eveningEase(w)
  const morningOpen = morningOpenness(w)

  const ambientLight = clamp(
    (calm ? 0.97 : 0.93) + evening * 0.038 + morningOpen * 0.022 - lock * 0.085 - freeze * 0.035,
    0.79,
    1,
  )

  const lightDiffusion = clamp(
    (calm ? 0.64 : 0.49) +
      evening * 0.095 -
      morningOpen * 0.055 -
      lock * 0.24 -
      (calm ? 0 : 0.08),
    0.26,
    0.74,
  )

  const surfaceIllumination = clamp(
    (calm ? 1.01 : 1.055) - lock * 0.14 + evening * -0.025 + morningOpen * 0.035,
    0.87,
    1.09,
  )

  const environmentSoftness = clamp(
    (calm ? 0.6 : 0.43) + evening * 0.11 - morningOpen * 0.06 - lock * 0.2,
    0.22,
    0.7,
  )

  const glassWarmth = computeGlassWarmth({ calm, evening, attentionLock: lock })

  return {
    ambientLight,
    glassWarmth,
    lightDiffusion,
    surfaceIllumination,
    environmentSoftness,
  }
}

export function applyLightEnvironment(input: LightEnvironmentInput): LightEnvironment {
  const env = computeLightEnvironment(input)
  const root = document.documentElement

  root.style.setProperty('--ambient-light', env.ambientLight.toFixed(3))
  root.style.setProperty('--light-diffusion', env.lightDiffusion.toFixed(3))
  root.style.setProperty('--surface-illumination', env.surfaceIllumination.toFixed(3))
  root.style.setProperty('--environment-softness', env.environmentSoftness.toFixed(3))

  applyMaterialWarmth(env.glassWarmth)
  applyAmbientLighting(env, { attentionLock: clamp(input.attentionLock, 0, 1) })

  return env
}
