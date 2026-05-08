import type { DockDensity } from './densityEngine'

export type DaySignals = {
  mode: 'calm' | 'busy'
  remindersCount: number
  pendingCount: number
  activeRecoveryChains: number
  minutesToNext?: number
  hasUrgent?: boolean
}

export type DensityDecision = {
  density: DockDensity
  pressure: number // 0..1
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function decideDockDensity(args: { scrollY: number; signals: DaySignals }): DensityDecision {
  const { scrollY, signals } = args

  let pressure = 0
  pressure += signals.mode === 'busy' ? 0.22 : 0.08
  pressure += clamp(signals.remindersCount / 6, 0, 0.28)
  pressure += clamp(signals.pendingCount / 3, 0, 0.22)
  pressure += clamp(signals.activeRecoveryChains / 4, 0, 0.18)

  if (typeof signals.minutesToNext === 'number') {
    if (signals.minutesToNext <= 60) pressure += 0.34
    else if (signals.minutesToNext <= 180) pressure += 0.18
  }
  if (signals.hasUrgent) pressure += 0.18

  pressure = clamp(pressure, 0, 1)

  // Base density by scroll
  let density: DockDensity =
    scrollY > 170 ? 'ultraCompact' : scrollY > 70 ? 'compact' : 'comfortable'

  // Context overrides (OS-like)
  if (pressure >= 0.72) density = 'ultraCompact'
  else if (pressure >= 0.42) density = density === 'comfortable' ? 'compact' : density
  else if (signals.mode === 'calm' && scrollY < 70) density = 'comfortable'

  return { density, pressure }
}

