import { glassTemperature } from './glassTemperature'
import { materialPriority } from './materialPriority'
import { applyDepthInterpolation, depthInterpolation } from './depthInterpolation'
import { applyGlassSurface } from './glassSurface'
import { applyMaterialVariation } from './materialVariation'
import { applyDepthNaturalization, computeDepthNaturalization } from './depthNaturalization'

export type AttentionDepthInput = {
  attentionLock: number
  focusContrast: number
  secondaryFade: number
  depthPriority: number
}

export function applyAttentionDepth(v: AttentionDepthInput) {
  const root = document.documentElement

  const temp = glassTemperature({ focusContrast: v.focusContrast, depthPriority: v.depthPriority })
  const mat = materialPriority(v)

  root.style.setProperty('--glass-temperature', temp.warmRgb)
  root.style.setProperty('--focus-sharpness', mat.focusSharpness.toFixed(3))
  root.style.setProperty('--material-depth', mat.materialDepth.toFixed(3))
  root.style.setProperty('--depth-opacity', mat.depthOpacity.toFixed(3))
  root.style.setProperty('--ink-border', mat.inkBorder.toFixed(3))

  const interp = depthInterpolation({
    attentionLock: v.attentionLock,
    focusSharpness: mat.focusSharpness,
    materialDepth: mat.materialDepth,
    focusContrast: v.focusContrast,
  })
  applyDepthInterpolation(interp)

  applyGlassSurface({
    attentionLock: v.attentionLock,
    focusSharpness: mat.focusSharpness,
    focusContrast: v.focusContrast,
    materialDepth: mat.materialDepth,
  })

  applyMaterialVariation({
    attentionLock: v.attentionLock,
    focusSharpness: mat.focusSharpness,
    focusContrast: v.focusContrast,
    materialDepth: mat.materialDepth,
  })

  applyDepthNaturalization(
    computeDepthNaturalization({
      attentionLock: v.attentionLock,
      focusContrast: v.focusContrast,
      secondaryFade: v.secondaryFade,
      depthPriority: v.depthPriority,
      materialDepth: mat.materialDepth,
      glassDistance: interp.glassDistance,
      focusSharpness: mat.focusSharpness,
    }),
  )
}

