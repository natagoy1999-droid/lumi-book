import { computeFocusEdgeShortening } from './focusEdgeShortening'
import { computeMaterialFalloff } from './materialFalloff'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type DepthNaturalizationInput = {
  attentionLock: number
  focusContrast: number
  secondaryFade: number
  depthPriority: number
  materialDepth: number
  glassDistance: number
  focusSharpness: number
}

export type DepthNaturalizationVars = {
  matteDepth: number
  materialFalloff: number
  edgeShortening: number
  focusDistance: number
  depthDiffusion: number
  insetExtraPx: number
  highlightDensity: number
}

/**
 * Orchestrates subconscious depth: matte masking, falloff, edge shortening, focus distance.
 * Values are intentionally subtle — felt, not seen.
 */
export function computeDepthNaturalization(i: DepthNaturalizationInput): DepthNaturalizationVars {
  const lock = clamp(i.attentionLock, 0, 1)
  const contrast = clamp(i.focusContrast, 0, 1)
  const depthP = clamp(i.depthPriority, 0, 1)
  const matDepth = clamp(i.materialDepth, 0, 1)
  const dist = clamp(i.glassDistance, 0, 1)

  const fall = computeMaterialFalloff({
    attentionLock: lock,
    materialDepth: matDepth,
    glassDistance: dist,
    secondaryFade: clamp(i.secondaryFade, 0, 1),
  })

  const matteDepth = clamp(
    0.14 + dist * 0.42 + matDepth * 0.32 + fall.falloff * 0.12 - lock * 0.05,
    0.12,
    0.56,
  )

  const edge = computeFocusEdgeShortening({
    attentionLock: lock,
    focusContrast: contrast,
    focusSharpness: clamp(i.focusSharpness, 0, 1),
  })

  const focusDistance = clamp(depthP * 0.78 + contrast * 0.18 + edge.shortening * 0.08, 0, 1)

  return {
    matteDepth,
    materialFalloff: fall.falloff,
    edgeShortening: edge.shortening,
    focusDistance,
    depthDiffusion: fall.diffusion,
    insetExtraPx: edge.insetExtraPx,
    highlightDensity: edge.highlightDensity,
  }
}

export function applyDepthNaturalization(v: DepthNaturalizationVars) {
  const root = document.documentElement
  root.style.setProperty('--matte-depth', v.matteDepth.toFixed(3))
  root.style.setProperty('--material-falloff', v.materialFalloff.toFixed(3))
  root.style.setProperty('--edge-shortening', v.edgeShortening.toFixed(3))
  root.style.setProperty('--focus-distance', v.focusDistance.toFixed(3))
  root.style.setProperty('--depth-diffusion', v.depthDiffusion.toFixed(3))
  root.style.setProperty('--material-diffusion', v.depthDiffusion.toFixed(3))
  root.style.setProperty('--edge-inset-extra', `${v.insetExtraPx}px`)
  root.style.setProperty('--focus-edge-density', v.highlightDensity.toFixed(3))
}
