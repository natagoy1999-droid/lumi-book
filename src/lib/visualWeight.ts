export type VisualWeight = {
  scale: number
  glow: number // 0..1
  opacity: number
  contrast: number // 0..1
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function weightFromScore(args: {
  score: number
  role: 'dominant' | 'secondary'
  compactness: 'normal' | 'ultra'
}): VisualWeight {
  const { score, role, compactness } = args

  // Normalize score into 0..1 assuming typical range 0..120
  const t = clamp(score / 120, 0, 1)

  if (role === 'dominant') {
    const baseScale = compactness === 'ultra' ? 0.92 : 0.98
    return {
      scale: lerp(baseScale, 1.0, t * 0.85),
      glow: lerp(0.45, 0.85, t),
      opacity: lerp(0.92, 1.0, t),
      contrast: lerp(0.72, 0.95, t),
    }
  }

  // secondary
  const baseScale = compactness === 'ultra' ? 0.88 : 0.94
  return {
    scale: lerp(baseScale, 0.96, t * 0.75),
    glow: lerp(0.10, 0.22, t),
    opacity: lerp(0.78, 0.92, t),
    contrast: lerp(0.40, 0.62, t),
  }
}

