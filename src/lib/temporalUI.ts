import type { WorkRhythmSignals } from './circadianMaterial'
import { computeCircadianMaterial } from './circadianMaterial'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export type TemporalUIInput = {
  now?: Date
  homeMode: 'calm' | 'busy'
  pressure: number
  remindersCount: number
}

/**
 * Temporal controller: applies circadian + workload-aware ambience as CSS vars and gentle patches.
 */
export function applyTemporalUI(input: TemporalUIInput) {
  const now = input.now ?? new Date()
  const rhythm: WorkRhythmSignals = {
    homeMode: input.homeMode,
    pressure: clamp(input.pressure, 0, 1),
    remindersCount: Math.max(0, input.remindersCount),
  }

  const patch = computeCircadianMaterial(now, rhythm)
  const root = document.documentElement

  root.style.setProperty('--time-warmth', patch.css.timeWarmth.toFixed(3))
  root.style.setProperty('--circadian-softness', patch.css.circadianSoftness.toFixed(3))
  root.style.setProperty('--ambient-rhythm', patch.css.ambientRhythm.toFixed(3))
  root.style.setProperty('--temporal-focus', patch.css.temporalFocus.toFixed(3))
  root.style.setProperty('--day-clarity', patch.css.dayClarity.toFixed(3))

  const gw = readVar('--glass-warmth', 0.28)
  root.style.setProperty('--glass-warmth', clamp(gw + patch.deltas.glassWarmth, 0.08, 0.58).toFixed(3))

  const ld = readVar('--light-diffusion', 0.5)
  root.style.setProperty('--light-diffusion', clamp(ld + patch.deltas.lightDiffusion, 0.22, 0.78).toFixed(3))

  const al = readVar('--ambient-light', 1)
  root.style.setProperty('--ambient-light', clamp(al + patch.deltas.ambientLight, 0.74, 1.02).toFixed(3))

  const mulVar = (name: string, mul: number, lo: number, hi: number) => {
    const v = readVar(name, 1)
    root.style.setProperty(name, clamp(v * mul, lo, hi).toFixed(3))
  }

  mulVar('--illumination-focus-mul', patch.muls.illuminationFocus, 0.82, 1.18)
  mulVar('--illumination-secondary-mul', patch.muls.illuminationSecondary, 0.78, 1.12)
  mulVar('--illumination-ambient-mul', patch.muls.illuminationAmbient, 0.72, 1.08)
  mulVar('--frost-ambient-mul', patch.muls.frostAmbient, 0.82, 1.15)
  mulVar('--material-density', patch.muls.materialDensity, 0.32, 0.95)

  const mq = readVar('--motion-quietness', 0)
  root.style.setProperty(
    '--motion-quietness',
    clamp(mq + patch.motionQuietNudge, 0, 1).toFixed(3),
  )

  const si = readVar('--surface-illumination', 1)
  root.style.setProperty(
    '--surface-illumination',
    clamp(si * (0.985 + patch.css.dayClarity * 0.025 - patch.css.circadianSoftness * 0.012), 0.82, 1.12).toFixed(
      3,
    ),
  )

  const es = readVar('--environment-softness', 0.45)
  root.style.setProperty(
    '--environment-softness',
    clamp(es + (patch.css.circadianSoftness - 1) * 0.08, 0.18, 0.76).toFixed(3),
  )
}
