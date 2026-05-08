import { edgeLength } from './edgeLength'
import { frostCleanliness } from './frostCleanliness'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function applyMaterialVariation(args: {
  attentionLock: number
  focusSharpness: number
  focusContrast: number
  materialDepth: number
}) {
  const root = document.documentElement
  const quiet = clamp(
    Number.parseFloat(getComputedStyle(root).getPropertyValue('--motion-quietness').trim()) || 0,
    0,
    1,
  )

  const frost = frostCleanliness({
    attentionLock: args.attentionLock,
    motionQuietness: quiet,
    materialDepth: args.materialDepth,
  })

  const edge = edgeLength({
    focusSharpness: args.focusSharpness,
    focusContrast: args.focusContrast,
    attentionLock: args.attentionLock,
  })

  root.style.setProperty('--frost-cleanliness', frost.cleanliness.toFixed(3))

  // Multipliers used in component math
  root.style.setProperty('--frost-mul', frost.frostMul.toFixed(3))
  root.style.setProperty('--noise-mul', frost.noiseMul.toFixed(3))

  root.style.setProperty('--edge-length', edge.length.toFixed(3))
  root.style.setProperty('--edge-inset', `${edge.insetPx}px`)
}

