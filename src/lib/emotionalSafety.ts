import { computeInterruptionIntensity } from './interruptionControl'
import { computeStressPressure, type StressPressureInput } from './stressPressure'

import { useEmotionalSafetyIntel } from '../state/emotionalSafetyIntel'
import { useInteractionTelemetry } from '../state/interactionTelemetry'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

/** Reassurance surface peaks in mid-high stress, silences at extremes. */
export function computeReassuranceLevel(stressPressure: number): number {
  const s = stressPressure
  if (s < 0.41 || s > 0.83) return 0
  const t = (s - 0.41) / (0.83 - 0.41)
  return clamp(Math.sin(t * Math.PI), 0, 1)
}

/** Professional calm assistance availability — drops when user is overloaded past usefulness. */
export function computeCalmAssistance(stressPressure: number, interruptionIntensity: number): number {
  return clamp(
    (1 - clamp((stressPressure - 0.78) / 0.22, 0, 1)) * (1 - interruptionIntensity * 0.35),
    0,
    1,
  )
}

export type EmotionalSafetyBundle = {
  stressPressure: number
  interruptionIntensity: number
  emotionalQuietness: number
  safeFocus: number
  calmAssistance: number
  reassuranceLevel: number
}

export function deriveEmotionalSafety(
  base: StressPressureInput,
  interruptionIntensity: number,
): EmotionalSafetyBundle {
  const stressPressure = computeStressPressure(base)
  const emotionalQuietness = clamp(
    0.14 + stressPressure * 0.48 + interruptionIntensity * 0.26 + base.cognitiveLoad * 0.12,
    0,
    1,
  )
  const safeFocus = clamp(0.28 + stressPressure * 0.52, 0, 1)
  const calmAssistance = computeCalmAssistance(stressPressure, interruptionIntensity)
  const reassuranceLevel = computeReassuranceLevel(stressPressure)

  return {
    stressPressure,
    interruptionIntensity,
    emotionalQuietness,
    safeFocus,
    calmAssistance,
    reassuranceLevel,
  }
}

/**
 * Humane emotional safety layer — runs after cognitive + trust math; compounds quietly.
 */
export function applyEmotionalSafetyLayer(args: {
  stressInput: StressPressureInput
  trustAssistantPresence: number
  trustPredictiveOpacity: number
}) {
  const tel = useInteractionTelemetry.getState()
  const interruptionIntensity = computeInterruptionIntensity(tel.navBurst, tel.scrollEwma)
  const bundle = deriveEmotionalSafety(args.stressInput, interruptionIntensity)

  const root = document.documentElement
  root.style.setProperty('--stress-pressure', bundle.stressPressure.toFixed(3))
  root.style.setProperty('--emotional-quietness', bundle.emotionalQuietness.toFixed(3))
  root.style.setProperty('--safe-focus', bundle.safeFocus.toFixed(3))
  root.style.setProperty('--calm-assistance', bundle.calmAssistance.toFixed(3))
  root.style.setProperty('--reassurance-level', bundle.reassuranceLevel.toFixed(3))

  const S = bundle.stressPressure
  const I = bundle.interruptionIntensity

  const presence = clamp(
    args.trustAssistantPresence * (1 - S * 0.44) * (1 - I * 0.22),
    0.06,
    0.98,
  )
  const predictive = clamp(args.trustPredictiveOpacity * (1 - S * 0.38) * (1 - I * 0.15), 0.08, 0.92)

  root.style.setProperty('--assistant-presence', presence.toFixed(3))
  root.style.setProperty('--predictive-opacity', predictive.toFixed(3))

  let mq = readVar('--motion-quietness', 0)
  mq = clamp(mq + S * 0.065 + bundle.emotionalQuietness * 0.035, 0, 1)
  root.style.setProperty('--motion-quietness', mq.toFixed(3))

  let amb = readVar('--ambient-light', 1)
  amb = clamp(amb * (1 - bundle.emotionalQuietness * 0.045), 0.76, 1.02)
  root.style.setProperty('--ambient-light', amb.toFixed(3))

  useEmotionalSafetyIntel.getState().setBundle(bundle)

  return bundle
}
