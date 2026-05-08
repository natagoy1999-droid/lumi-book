import { coldGlass } from './coldGlass'
import { materialEdge } from './materialEdge'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type DepthInterpolationVars = {
  materialTemperatureRgb: string
  glassDistance: number
  depthShiftPx: number
  focusEdgeOpacity: number
  edgeRgb: string
}

export function depthInterpolation(args: {
  attentionLock: number
  focusSharpness: number
  materialDepth: number
  focusContrast: number
}): DepthInterpolationVars {
  const lock = clamp(args.attentionLock, 0, 1)
  const sharp = clamp(args.focusSharpness, 0, 1)
  const depth = clamp(args.materialDepth, 0, 1)
  const contrast = clamp(args.focusContrast, 0, 1)

  const edge = materialEdge({ focusSharpness: sharp, attentionLock: lock })
  const cold = coldGlass({ materialDepth: depth, attentionLock: lock })

  // Warmer when contrast/sharpness is higher; never neon.
  const warm = 0.35 + contrast * 0.45 + sharp * 0.15
  const tempRgb = warm >= 0.6 ? '214 198 140' : '255 255 255'

  // Micro depth shift: dominant forward (negative y), secondary back (positive y) handled in component.
  const depthShiftPx = clamp(0.15 + contrast * 0.6, 0.15, 0.95) * (1 - lock * 0.25)

  return {
    materialTemperatureRgb: tempRgb,
    glassDistance: cold.distance,
    depthShiftPx,
    focusEdgeOpacity: edge.edgeOpacity,
    edgeRgb: edge.edgeRgb,
  }
}

export function applyDepthInterpolation(v: DepthInterpolationVars) {
  const root = document.documentElement
  root.style.setProperty('--material-temperature', v.materialTemperatureRgb)
  root.style.setProperty('--glass-distance', v.glassDistance.toFixed(3))
  root.style.setProperty('--depth-shift', `${v.depthShiftPx.toFixed(2)}px`)
  root.style.setProperty('--focus-edge-opacity', v.focusEdgeOpacity.toFixed(3))
  root.style.setProperty('--edge-highlight', v.edgeRgb)
}

