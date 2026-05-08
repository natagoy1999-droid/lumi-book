import { frostNoise } from './frostNoise'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type MaterialTextureVars = {
  frostOpacity: number
  surfaceNoise: number
  materialSoftness: number
  glassCleanliness: number
}

export function materialTexture(args: {
  materialDepth: number
  attentionLock: number
  focusSharpness: number
}): MaterialTextureVars {
  const d = clamp(args.materialDepth, 0, 1)
  const lock = clamp(args.attentionLock, 0, 1)
  const sharp = clamp(args.focusSharpness, 0, 1)

  const frost = frostNoise({ materialDepth: d, attentionLock: lock })

  // Secondary depth -> softer / slightly less clean
  const materialSoftness = clamp(0.35 + d * 0.45, 0.25, 0.85)
  // Focus sharpness + lock -> cleaner
  const glassCleanliness = clamp(0.72 + sharp * 0.22 + lock * 0.10 - d * 0.10, 0.6, 1)

  return {
    frostOpacity: frost.frostOpacity,
    surfaceNoise: frost.surfaceNoise,
    materialSoftness,
    glassCleanliness,
  }
}

