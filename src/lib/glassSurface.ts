import { edgeSharpness } from './edgeSharpness'
import { materialTexture } from './materialTexture'

export function applyGlassSurface(args: {
  attentionLock: number
  focusSharpness: number
  focusContrast: number
  materialDepth: number
}) {
  const root = document.documentElement

  const edge = edgeSharpness({
    focusSharpness: args.focusSharpness,
    focusContrast: args.focusContrast,
    attentionLock: args.attentionLock,
  })
  const tex = materialTexture({
    materialDepth: args.materialDepth,
    attentionLock: args.attentionLock,
    focusSharpness: args.focusSharpness,
  })

  root.style.setProperty('--edge-sharpness', edge.edgeSharpness.toFixed(3))
  root.style.setProperty('--focus-edge-opacity', edge.focusEdgeOpacity.toFixed(3))
  root.style.setProperty('--ink-border', edge.inkBorder.toFixed(3))

  root.style.setProperty('--frost-opacity', tex.frostOpacity.toFixed(3))
  root.style.setProperty('--surface-noise', tex.surfaceNoise.toFixed(3))
  root.style.setProperty('--material-softness', tex.materialSoftness.toFixed(3))
  root.style.setProperty('--glass-cleanliness', tex.glassCleanliness.toFixed(3))
}

