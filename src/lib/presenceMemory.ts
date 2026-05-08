import {
  clamp,
  comfortLearningAlpha,
  conflictDampening,
  crossAxisConflict,
  lerp,
} from './professionalComfort'
import { familiarityFromObservationMass } from './familiarAtmosphere'

import type { PresencePreferenceSnapshot } from '../state/presenceIntel'
import { usePresenceIntel } from '../state/presenceIntel'
import { useCognitiveUI } from '../state/cognitiveUI'

const STORAGE_KEY = 'lumi_presence_memory_v1'

export type PersistedPresenceMemory = {
  v: 1
  preferredCalmness: number
  preferredDensity: number
  preferredSoftness: number
  preferredPacing: number
  assistantQuietAffinity: number
  dockIntensityAffinity: number
  advisoryAffinity: number
  observationMass: number
  sampleCount: number
}

function defaults(): PersistedPresenceMemory {
  return {
    v: 1,
    preferredCalmness: 0.5,
    preferredDensity: 0.48,
    preferredSoftness: 0.52,
    preferredPacing: 0.48,
    assistantQuietAffinity: 0.5,
    dockIntensityAffinity: 0.5,
    advisoryAffinity: 0.48,
    observationMass: 0,
    sampleCount: 0,
  }
}

function load(): PersistedPresenceMemory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults()
    const p = JSON.parse(raw) as Partial<PersistedPresenceMemory>
    if (p.v !== 1) return defaults()
    const d = defaults()
    return {
      ...d,
      ...p,
      preferredCalmness: clamp(p.preferredCalmness ?? d.preferredCalmness, 0, 1),
      preferredDensity: clamp(p.preferredDensity ?? d.preferredDensity, 0, 1),
      preferredSoftness: clamp(p.preferredSoftness ?? d.preferredSoftness, 0, 1),
      preferredPacing: clamp(p.preferredPacing ?? d.preferredPacing, 0, 1),
      assistantQuietAffinity: clamp(p.assistantQuietAffinity ?? d.assistantQuietAffinity, 0, 1),
      dockIntensityAffinity: clamp(p.dockIntensityAffinity ?? d.dockIntensityAffinity, 0, 1),
      advisoryAffinity: clamp(p.advisoryAffinity ?? d.advisoryAffinity, 0, 1),
      observationMass: Math.max(0, p.observationMass ?? 0),
      sampleCount: Math.max(0, p.sampleCount ?? 0),
    }
  } catch {
    return defaults()
  }
}

function save(p: PersistedPresenceMemory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* ignore quota */
  }
}

function toSnapshot(p: PersistedPresenceMemory): PresencePreferenceSnapshot {
  return {
    preferredCalmness: p.preferredCalmness,
    preferredDensity: p.preferredDensity,
    preferredSoftness: p.preferredSoftness,
    preferredPacing: p.preferredPacing,
    assistantQuietAffinity: p.assistantQuietAffinity,
    dockIntensityAffinity: p.dockIntensityAffinity,
    advisoryAffinity: p.advisoryAffinity,
    observationMass: p.observationMass,
    sampleCount: p.sampleCount,
  }
}

export type PresenceMemoryObservationInput = {
  mentalQuietness: number
  ambientQuietness: number
  motionQuietness: number
  environmentSoftness: number
  communicationSoftness: number
  quietDensity: number
  cognitiveLoad: number
  stressPressure: number
  workflowCalm: number
  flowMomentum: number
  navBurst: number
  scrollEwma: number
  trustSuppression: number
  dockPressure: number
  rhythmCompression: number
  typingEwmaMs: number
}

function normalizeScroll(scrollEwma: number): number {
  return clamp(scrollEwma / 1180, 0, 1)
}

function normalizeNav(navBurst: number): number {
  return clamp(navBurst, 0, 1)
}

function inferTargets(obs: PresenceMemoryObservationInput) {
  const navN = normalizeNav(obs.navBurst)
  const scrN = normalizeScroll(obs.scrollEwma)
  const typing = clamp(520 / Math.max(obs.typingEwmaMs, 220), 0.15, 2.2)

  const calmness = clamp(
    obs.mentalQuietness * 0.26 +
      obs.ambientQuietness * 0.2 +
      obs.motionQuietness * 0.12 +
      obs.workflowCalm * 0.22 +
      (1 - obs.stressPressure) * 0.2 -
      navN * 0.08 -
      scrN * 0.06,
    0,
    1,
  )

  const density = clamp(
    scrN * 0.26 +
      navN * 0.26 +
      obs.cognitiveLoad * 0.22 +
      obs.rhythmCompression * 0.2 +
      obs.quietDensity * 0.12 +
      (1 - obs.workflowCalm) * 0.1,
    0,
    1,
  )

  const softness = clamp(
    obs.communicationSoftness * 0.55 + obs.environmentSoftness * 0.25 + obs.trustSuppression * 0.2,
    0,
    1,
  )

  const pacing = clamp(
    obs.flowMomentum * 0.36 + navN * 0.24 + typing * 0.18 + (1 - obs.workflowCalm) * 0.14,
    0,
    1,
  )

  const assistantQuiet = clamp(
    obs.mentalQuietness * 0.3 + obs.ambientQuietness * 0.24 + obs.trustSuppression * 0.32 + (1 - obs.cognitiveLoad) * 0.14,
    0,
    1,
  )

  const dockIntensity = clamp(0.45 + obs.dockPressure * 0.14 + (1 - calmness) * 0.12 + navN * 0.16, 0, 1)

  const advisory = clamp(
    obs.ambientQuietness * 0.28 + (1 - obs.cognitiveLoad) * 0.32 + obs.workflowCalm * 0.24 + (1 - navN) * 0.16,
    0,
    1,
  )

  return {
    calmness,
    density,
    softness,
    pacing,
    assistantQuiet,
    dockIntensity,
    advisory,
  }
}

/**
 * One long-horizon learning step from passive signals. No visible UI; reversible tiny drifts.
 */
export function tickPresenceMemory(obs: PresenceMemoryObservationInput) {
  const t = inferTargets(obs)
  let s = load()
  const fam = familiarityFromObservationMass(s.observationMass)

  const x1 = crossAxisConflict(t.calmness, t.density)

  const u1 = comfortLearningAlpha({
    familiarity: fam,
    conflict: conflictDampening(t.calmness - s.preferredCalmness),
    crossConflict: x1,
  })
  s.preferredCalmness = lerp(s.preferredCalmness, t.calmness, u1)

  const u2 = comfortLearningAlpha({
    familiarity: fam,
    conflict: conflictDampening(t.density - s.preferredDensity),
    crossConflict: x1,
  })
  s.preferredDensity = lerp(s.preferredDensity, t.density, u2)

  const u3 = comfortLearningAlpha({
    familiarity: fam,
    conflict: conflictDampening(t.softness - s.preferredSoftness),
    crossConflict: x1,
  })
  s.preferredSoftness = lerp(s.preferredSoftness, t.softness, u3)

  const u4 = comfortLearningAlpha({
    familiarity: fam,
    conflict: conflictDampening(t.pacing - s.preferredPacing),
    crossConflict: x1,
  })
  s.preferredPacing = lerp(s.preferredPacing, t.pacing, u4)

  const u5 = comfortLearningAlpha({
    familiarity: fam,
    conflict: conflictDampening(t.assistantQuiet - s.assistantQuietAffinity),
    crossConflict: x1,
  })
  s.assistantQuietAffinity = lerp(s.assistantQuietAffinity, t.assistantQuiet, u5)

  const u6 = comfortLearningAlpha({
    familiarity: fam,
    conflict: conflictDampening(t.dockIntensity - s.dockIntensityAffinity),
    crossConflict: x1,
  })
  s.dockIntensityAffinity = lerp(s.dockIntensityAffinity, t.dockIntensity, u6)

  const u7 = comfortLearningAlpha({
    familiarity: fam,
    conflict: conflictDampening(t.advisory - s.advisoryAffinity),
    crossConflict: x1,
  })
  s.advisoryAffinity = lerp(s.advisoryAffinity, t.advisory, u7)

  s.sampleCount += 1
  s.observationMass += 0.14 * x1

  save(s)
  usePresenceIntel.getState().setSnapshot(toSnapshot(s))
}

export function hydratePresenceMemory() {
  const s = load()
  usePresenceIntel.getState().setSnapshot(toSnapshot(s))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Build observation from post-pipeline CSS tokens + telemetry (call late in material tick).
 */
export function buildPresenceObservationFromContext(args: {
  tel: { navBurst: number; scrollEwma: number; typingIntervalsEwmaMs: number }
  stressPressure: number
  flow: { workflowCalm: number; flowMomentum: number }
  trustSuppression: number
}): PresenceMemoryObservationInput {
  return {
    mentalQuietness: readVar('--mental-quietness', 0),
    ambientQuietness: readVar('--ambient-quietness', 0),
    motionQuietness: readVar('--motion-quietness', 0),
    environmentSoftness: readVar('--environment-softness', 0.45),
    communicationSoftness: readVar('--communication-softness', 0.52),
    quietDensity: readVar('--quiet-density', 0.35),
    cognitiveLoad: useCognitiveUI.getState().policy.load,
    stressPressure: args.stressPressure,
    workflowCalm: args.flow.workflowCalm,
    flowMomentum: args.flow.flowMomentum,
    navBurst: args.tel.navBurst,
    scrollEwma: args.tel.scrollEwma,
    trustSuppression: args.trustSuppression,
    dockPressure: readVar('--dock-pressure', 0),
    rhythmCompression: useCognitiveUI.getState().policy.rhythmCompression,
    typingEwmaMs: args.tel.typingIntervalsEwmaMs,
  }
}
