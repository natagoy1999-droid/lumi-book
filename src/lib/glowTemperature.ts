export type Temperature = 'critical' | 'important' | 'neutral'

export type GlowTemp = {
  rgb: string // "r g b"
  pulse: number // 0..1
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function temperatureFromScore(score: number): Temperature {
  if (score >= 85) return 'critical'
  if (score >= 55) return 'important'
  return 'neutral'
}

export function glowTemp(t: Temperature, compactness: 'normal' | 'ultra'): GlowTemp {
  // Never neon: only subtle warm/cold shifts.
  if (t === 'critical') {
    return {
      rgb: '214 178 90', // warm gold
      pulse: compactness === 'ultra' ? 0.22 : 0.42,
    }
  }
  if (t === 'important') {
    return {
      rgb: '214 198 140', // champagne
      pulse: compactness === 'ultra' ? 0.14 : 0.28,
    }
  }
  return {
    rgb: '255 255 255', // cold glass (almost none)
    pulse: compactness === 'ultra' ? 0.06 : 0.12,
  }
}

export function pulseOpacity(base: number, pulse: number) {
  return clamp(base + pulse, 0, 1)
}

