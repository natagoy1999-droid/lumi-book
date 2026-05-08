import type { MaterialHierarchy } from './materialHierarchy'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export const MATERIAL_CSS = {
  surfacePrimary: '--surface-primary',
  surfaceSecondary: '--surface-secondary',
  surfaceAmbient: '--surface-ambient',
  glassFocus: '--glass-focus',
  glassDiffuse: '--glass-diffuse',
  materialDensity: '--material-density',
  blurFocus: '--glass-blur-focus-scale',
  blurInteractive: '--glass-blur-interactive-scale',
  blurAmbient: '--glass-blur-ambient-scale',
} as const

/**
 * Writes global material tokens derived from hierarchy + lock coupling.
 * Surfaces use alpha on white fog; blur scales multiply unified --glass-blur.
 */
export function applyMaterialTokens(h: MaterialHierarchy, args: { attentionLock: number }) {
  const root = document.documentElement
  const lock = clamp(args.attentionLock, 0, 1)

  root.style.setProperty(MATERIAL_CSS.blurFocus, h.focusBlurScale.toFixed(3))
  root.style.setProperty(MATERIAL_CSS.blurInteractive, h.interactiveBlurScale.toFixed(3))
  root.style.setProperty(MATERIAL_CSS.blurAmbient, h.ambientBlurScale.toFixed(3))

  root.style.setProperty(MATERIAL_CSS.glassFocus, h.focusBlurScale.toFixed(3))
  root.style.setProperty(MATERIAL_CSS.glassDiffuse, h.interactiveBlurScale.toFixed(3))

  const primaryA = clamp(0.58 + h.focusSoftness * 0.35 - lock * 0.06, 0.52, 0.74)
  const secondaryA = clamp(0.5 + h.interactiveSoftness * 0.22 - lock * 0.04, 0.44, 0.66)
  const ambientA = clamp(0.42 + h.ambientSoftness * 0.18, 0.36, 0.58)

  root.style.setProperty(MATERIAL_CSS.surfacePrimary, primaryA.toFixed(3))
  root.style.setProperty(MATERIAL_CSS.surfaceSecondary, secondaryA.toFixed(3))
  root.style.setProperty(MATERIAL_CSS.surfaceAmbient, ambientA.toFixed(3))

  const density = clamp(
    0.42 + h.focusDepthScale * 0.18 + (1 - h.interactiveSoftness) * 0.12 + lock * 0.14,
    0.38,
    0.88,
  )
  root.style.setProperty(MATERIAL_CSS.materialDensity, density.toFixed(3))

  root.style.setProperty('--glass-border-focus-mul', clamp(1.04 + lock * 0.04, 1, 1.12).toFixed(3))
  root.style.setProperty('--glass-border-interactive-mul', '1')
  root.style.setProperty(
    '--glass-border-ambient-mul',
    clamp(0.94 - lock * 0.03, 0.88, 1).toFixed(3),
  )

  root.style.setProperty('--surface-depth-focus', h.focusDepthScale.toFixed(3))
  root.style.setProperty('--surface-depth-interactive', h.interactiveDepthScale.toFixed(3))
  root.style.setProperty('--surface-depth-ambient', h.ambientDepthScale.toFixed(3))

  root.style.setProperty('--material-softness-global', h.interactiveSoftness.toFixed(3))
  root.style.setProperty('--ambient-material-warmth', h.ambientWarmth.toFixed(3))
}
