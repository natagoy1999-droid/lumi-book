function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type MagneticSpacing = {
  gapPx: number
  dominantPadX: number
  dominantPadY: number
  secondaryScale: number
}

export function magneticSpacing(args: {
  score: number
  compactness: 'normal' | 'ultra'
}): MagneticSpacing {
  const { score, compactness } = args
  const t = clamp(score / 120, 0, 1)

  const gapPx = compactness === 'ultra' ? 6 : 8 + Math.round(t * 2)
  const dominantPadX = compactness === 'ultra' ? 12 : 14 + Math.round(t * 2)
  const dominantPadY = compactness === 'ultra' ? 10 : 12 + Math.round(t * 2)
  const secondaryScale = compactness === 'ultra' ? 0.92 : 0.95 - t * 0.02

  return { gapPx, dominantPadX, dominantPadY, secondaryScale }
}

