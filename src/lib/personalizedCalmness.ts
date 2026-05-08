import { atmosphereContinuityBias, familiarityFromObservationMass } from './familiarAtmosphere'
import { blendTokenTowardPreferred, clamp } from './professionalComfort'

import { usePresenceIntel } from '../state/presenceIntel'

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Writes preferred-* + presence-familiarity tokens and applies imperceptible nudges
 * to existing atmosphere variables (reversible, capped each frame).
 */
export function applyPersonalizedCalmnessLayer() {
  const snap = usePresenceIntel.getState().snapshot
  if (!snap) return

  const fam = familiarityFromObservationMass(snap.observationMass)
  const root = document.documentElement

  root.style.setProperty('--preferred-calmness', snap.preferredCalmness.toFixed(3))
  root.style.setProperty('--preferred-density', snap.preferredDensity.toFixed(3))
  root.style.setProperty('--preferred-softness', snap.preferredSoftness.toFixed(3))
  root.style.setProperty('--preferred-pacing', snap.preferredPacing.toFixed(3))
  root.style.setProperty('--presence-familiarity', fam.toFixed(3))

  const calmBlend = fam * 0.72
  const mq = blendTokenTowardPreferred({
    current: readVar('--mental-quietness', 0),
    preferred: snap.preferredCalmness,
    familiarity: calmBlend,
    maxStep: 0.028,
  })
  root.style.setProperty('--mental-quietness', mq.toFixed(3))

  const aq = blendTokenTowardPreferred({
    current: readVar('--ambient-quietness', 0),
    preferred: snap.preferredCalmness * 0.92 + snap.advisoryAffinity * 0.08,
    familiarity: calmBlend,
    maxStep: 0.024,
  })
  root.style.setProperty('--ambient-quietness', aq.toFixed(3))

  const mot = blendTokenTowardPreferred({
    current: readVar('--motion-quietness', 0),
    preferred: snap.preferredCalmness,
    familiarity: calmBlend * 0.85,
    maxStep: 0.022,
  })
  root.style.setProperty('--motion-quietness', mot.toFixed(3))

  const env = blendTokenTowardPreferred({
    current: readVar('--environment-softness', 0.45),
    preferred: snap.preferredSoftness * 0.55 + snap.preferredCalmness * 0.45,
    familiarity: fam * 0.55,
    maxStep: 0.02,
  })
  root.style.setProperty('--environment-softness', env.toFixed(3))

  const comm = blendTokenTowardPreferred({
    current: readVar('--communication-softness', 0.52),
    preferred: snap.preferredSoftness,
    familiarity: fam * 0.6,
    maxStep: 0.022,
  })
  root.style.setProperty('--communication-softness', comm.toFixed(3))

  const pacingMul = 1 + (snap.preferredPacing - 0.5) * fam * 0.042
  const gr = clamp(readVar('--global-rhythm', 1) * pacingMul, 0.94, 1.06)
  root.style.setProperty('--global-rhythm', gr.toFixed(4))

  const uims = clamp(readVar('--ui-motion-scale', 1) * (1 + (snap.preferredPacing - 0.5) * fam * 0.035), 0.94, 1.06)
  root.style.setProperty('--ui-motion-scale', uims.toFixed(4))

  const densityMul = 1 + (snap.preferredDensity - 0.5) * fam * 0.048
  const cs = clamp(readVar('--compact-scale', 1) * densityMul, 0.93, 1.07)
  root.style.setProperty('--compact-scale', cs.toFixed(4))

  const ap = readVar('--assistant-presence', 0.55)
  const quietLean = (snap.assistantQuietAffinity - 0.5) * fam * 0.07
  root.style.setProperty('--assistant-presence', clamp(ap - quietLean, 0.38, 0.72).toFixed(3))

  const pred = readVar('--predictive-opacity', 0.72)
  root.style.setProperty(
    '--predictive-opacity',
    clamp(pred - quietLean * 0.65, 0.52, 0.82).toFixed(3),
  )

  const dg = readVar('--dock-glow-opacity', 0.55)
  const dockLean = (snap.dockIntensityAffinity - 0.5) * fam * 0.06
  root.style.setProperty('--dock-glow-opacity', clamp(dg + dockLean, 0.38, 0.68).toFixed(3))

  const lw = readVar('--living-glass', 0.72)
  root.style.setProperty(
    '--living-glass',
    clamp(lw + atmosphereContinuityBias(fam), 0.58, 0.88).toFixed(3),
  )
}