import { temperatureFromScore } from './glowTemperature'

export type LayoutPhysicsVars = {
  ctaGapPx: number
  dominantPushPx: number
  dominantExtraPadX: number
  dominantExtraPadY: number
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function layoutPhysics(args: {
  dominantScore: number
  density: 'comfortable' | 'compact' | 'ultraCompact'
}): LayoutPhysicsVars {
  const { dominantScore, density } = args
  const t = clamp(dominantScore / 120, 0, 1)
  const temp = temperatureFromScore(dominantScore)

  const baseGap = density === 'ultraCompact' ? 6 : density === 'compact' ? 7 : 8
  const ctaGapPx = baseGap + Math.round(t * 2)

  // Push: extra breathing space around dominant CTA (without scaling layout)
  const dominantPushPx =
    density === 'ultraCompact'
      ? Math.round(2 + t * 3)
      : density === 'compact'
        ? Math.round(3 + t * 4)
        : Math.round(4 + t * 5)

  // Extra padding for dominant CTA, warmer temps get tiny bit more space
  const warmBoost = temp === 'critical' ? 2 : temp === 'important' ? 1 : 0
  const dominantExtraPadX = Math.round(dominantPushPx + warmBoost)
  const dominantExtraPadY = Math.round(dominantPushPx * 0.55 + warmBoost * 0.5)

  return { ctaGapPx, dominantPushPx, dominantExtraPadX, dominantExtraPadY }
}

export function applyLayoutPhysics(v: LayoutPhysicsVars) {
  const root = document.documentElement
  root.style.setProperty('--cta-gap', `${v.ctaGapPx}px`)
  root.style.setProperty('--dominant-push', `${v.dominantPushPx}px`)
  root.style.setProperty('--dominant-extra-pad-x', `${v.dominantExtraPadX}px`)
  root.style.setProperty('--dominant-extra-pad-y', `${v.dominantExtraPadY}px`)
}

