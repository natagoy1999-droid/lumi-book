import { glowTemp, temperatureFromScore } from './glowTemperature'
import { magneticSpacing } from './magneticSpacing'
import type React from 'react'

export type AttentionVars = {
  glowTemperatureRgb: string
  dockGlowOpacity: number
  magneticGapPx: number
  priorityScale: number
  focusOpacity: number
  dockDensity: number
  dominantPadX: number
  dominantPadY: number
  secondaryScale: number
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function computeAttentionVars(args: {
  dominantScore: number
  compactness: 'normal' | 'ultra'
}): AttentionVars {
  const { dominantScore, compactness } = args
  const temp = glowTemp(temperatureFromScore(dominantScore), compactness)
  const space = magneticSpacing({ score: dominantScore, compactness })

  const t = clamp(dominantScore / 120, 0, 1)
  const dockDensity = compactness === 'ultra' ? 0.86 : 1
  const priorityScale = compactness === 'ultra' ? 0.985 : 1
  const focusOpacity = clamp(0.94 + t * 0.06, 0, 1)

  // Blend with global scroll-based --dock-glow-opacity by multiplying
  const dockGlowOpacity = clamp((compactness === 'ultra' ? 0.22 : 0.35) + temp.pulse * 0.35, 0.08, 0.6)

  return {
    glowTemperatureRgb: temp.rgb,
    dockGlowOpacity,
    magneticGapPx: space.gapPx,
    priorityScale,
    focusOpacity,
    dockDensity,
    dominantPadX: space.dominantPadX,
    dominantPadY: space.dominantPadY,
    secondaryScale: space.secondaryScale,
  }
}

export function varsToStyle(v: AttentionVars) {
  return {
    ['--glow-temperature' as any]: v.glowTemperatureRgb,
    ['--dock-glow-opacity' as any]: String(v.dockGlowOpacity),
    ['--magnetic-gap' as any]: `${v.magneticGapPx}px`,
    ['--priority-scale' as any]: String(v.priorityScale),
    ['--focus-opacity' as any]: String(v.focusOpacity),
    ['--dock-density' as any]: String(v.dockDensity),
    ['--dominant-pad-x' as any]: `${v.dominantPadX}px`,
    ['--dominant-pad-y' as any]: `${v.dominantPadY}px`,
    ['--secondary-scale' as any]: String(v.secondaryScale),
  } as React.CSSProperties
}

