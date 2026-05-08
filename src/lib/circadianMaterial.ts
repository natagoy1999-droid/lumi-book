import type { CircadianPhase } from './dayRhythm'
import { circadianPhaseWeights, eveningEase, morningOpenness } from './dayRhythm'
import { computeEmotionalTiming } from './emotionalTiming'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type WorkRhythmSignals = {
  homeMode: 'calm' | 'busy'
  pressure: number
  remindersCount: number
}

export type CircadianMaterialPatch = {
  css: {
    timeWarmth: number
    circadianSoftness: number
    ambientRhythm: number
    temporalFocus: number
    dayClarity: number
  }
  deltas: {
    glassWarmth: number
    lightDiffusion: number
    ambientLight: number
  }
  muls: {
    illuminationFocus: number
    illuminationSecondary: number
    illuminationAmbient: number
    frostAmbient: number
    materialDensity: number
  }
  motionQuietNudge: number
}

type Targets = {
  tw: number
  cs: number
  ar: number
  tf: number
  dc: number
}

const PHASE_TARGETS: Record<CircadianPhase, Targets> = {
  morning: { tw: 0.93, cs: 0.91, ar: 1.045, tf: 1.028, dc: 1.058 },
  day: { tw: 0.996, cs: 0.988, ar: 1.004, tf: 1.032, dc: 1.032 },
  evening: { tw: 1.048, cs: 1.065, ar: 0.958, tf: 0.982, dc: 0.968 },
  late_focus: { tw: 1.012, cs: 1.072, ar: 0.908, tf: 1.048, dc: 1.045 },
}

function blendTargets(weights: Record<CircadianPhase, number>): Targets {
  let tw = 0
  let cs = 0
  let ar = 0
  let tf = 0
  let dc = 0
  ;(Object.keys(weights) as CircadianPhase[]).forEach((k) => {
    const w = weights[k]
    const p = PHASE_TARGETS[k]
    tw += p.tw * w
    cs += p.cs * w
    ar += p.ar * w
    tf += p.tf * w
    dc += p.dc * w
  })
  return { tw, cs, ar, tf, dc }
}

/**
 * Circadian material engine + focused-calm evening when workload is high.
 */
export function computeCircadianMaterial(
  now: Date,
  rhythm: WorkRhythmSignals,
): CircadianMaterialPatch {
  const weights = circadianPhaseWeights(now)
  const open = morningOpenness(weights)
  const ease = eveningEase(weights)

  const eveningBand = weights.evening + weights.late_focus * 0.55
  const busyEveningPull = clamp(
    eveningBand * rhythm.pressure * (rhythm.homeMode === 'busy' ? 1 : 0.35) *
      (rhythm.remindersCount >= 2 ? 1 : 0.55),
    0,
    1,
  )

  let base = blendTargets(weights)

  // Morning: fresher, lighter (openness)
  base.dc += open * 0.022
  base.tw -= open * 0.028
  base.cs -= open * 0.018
  base.ar += open * 0.014

  // Evening calm (not cozy if busy evening → focused calm)
  base.cs += ease * (1 - busyEveningPull * 0.85) * 0.028
  base.tw += ease * (1 - busyEveningPull * 0.9) * 0.032
  base.ar -= ease * 0.022 * (1 + busyEveningPull * 0.35)

  // Busy evening override: cooler warmth, cleaner focus, less haze
  base.tw -= busyEveningPull * 0.052
  base.dc += busyEveningPull * 0.038
  base.tf += busyEveningPull * 0.028
  base.cs -= busyEveningPull * 0.034

  const emotional = computeEmotionalTiming(weights, { busyEveningPull })
  base.ar *= emotional.rhythmEase

  base.tw = clamp(base.tw, 0.88, 1.09)
  base.cs = clamp(base.cs, 0.86, 1.12)
  base.ar = clamp(base.ar, 0.88, 1.07)
  base.tf = clamp(base.tf, 0.94, 1.09)
  base.dc = clamp(base.dc, 0.92, 1.09)

  const deltas = {
    glassWarmth: clamp((base.tw - 1) * 0.14 + ease * 0.018 - busyEveningPull * 0.022, -0.045, 0.045),
    lightDiffusion: clamp((base.cs - 1) * 0.12 + ease * 0.05 - busyEveningPull * 0.04 - open * 0.035, -0.06, 0.07),
    ambientLight: clamp((base.ar - 1) * 0.08 - weights.late_focus * 0.028 + open * 0.022, -0.045, 0.04),
  }

  const muls = {
    illuminationFocus: clamp(1 + (base.tf - 1) * 0.55 + (base.dc - 1) * 0.35, 0.965, 1.055),
    illuminationSecondary: clamp(1 + (base.tf - 1) * 0.35 + (base.dc - 1) * 0.25 - ease * 0.035, 0.94, 1.035),
    illuminationAmbient: clamp(1 + (base.tf - 1) * 0.12 - ease * 0.045, 0.92, 1.02),
    frostAmbient: clamp(1 + (base.cs - 1) * 0.45 - busyEveningPull * 0.05, 0.93, 1.09),
    materialDensity: clamp(1 + weights.day * 0.028 + busyEveningPull * 0.022 - open * 0.018, 0.97, 1.045),
  }

  return {
    css: {
      timeWarmth: base.tw,
      circadianSoftness: base.cs,
      ambientRhythm: base.ar,
      temporalFocus: base.tf,
      dayClarity: base.dc,
    },
    deltas,
    muls,
    motionQuietNudge: emotional.motionQuietNudge,
  }
}
