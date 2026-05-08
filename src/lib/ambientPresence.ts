import { blendEnvironmentSoftness, deriveSpatialQuietness } from './spatialAtmosphere'
import { deriveLivingGlass } from './livingMaterial'
import { computeTransitionChurn, deriveEnvironmentalContinuity } from './environmentContinuity'

import { useBehavioralIntel } from '../state/behavioralIntel'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useEmotionalSafetyIntel } from '../state/emotionalSafetyIntel'
import { useEnergyIntel } from '../state/energyIntel'
import { useFlowIntel } from '../state/flowIntel'
import { useInteractionTelemetry } from '../state/interactionTelemetry'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export type AmbientPresenceDerived = {
  ambientPresence: number
  materialStillness: number
  environmentSoftness: number
  spatialQuietness: number
  livingGlass: number
}

export type AmbientPresenceSignals = {
  cognitiveLoad: number
  flowMomentum: number
  workflowCalm: number
  fatigueLevel: number
  stressPressure: number
  energyQuietness: number
  mentalQuietness: number
  ambientQuietness: number
  environmentSoftnessBase: number
  navBurst: number
  continuityBias: number
  hourOfDay: number
}

/**
 * Unified ambient presence — passive environmental rhythm (no labels, no wellness tone).
 */
export function deriveAmbientPresence(signals: AmbientPresenceSignals): AmbientPresenceDerived {
  const evening =
    signals.hourOfDay >= 22 || signals.hourOfDay < 5 ? 0.44 : signals.hourOfDay >= 19 ? 0.2 : 0

  const strainBlend = clamp(
    signals.cognitiveLoad * 0.36 + signals.stressPressure * 0.34 + signals.fatigueLevel * 0.3,
    0,
    1,
  )

  const calmBlend = clamp(
    signals.workflowCalm * (1 - strainBlend * 0.52) +
      signals.flowMomentum * 0.18 * (1 - signals.stressPressure * 0.55),
    0,
    1,
  )

  const ambientPresence = clamp(
    calmBlend * (1 - evening * 0.38) * (1 - signals.energyQuietness * 0.28),
    0.06,
    0.94,
  )

  const materialStillness = clamp(
    strainBlend * 0.52 +
      evening * 0.38 +
      signals.mentalQuietness * 0.26 +
      signals.ambientQuietness * 0.22 +
      signals.continuityBias * 0.16,
    0,
    1,
  )

  const spatialQuietness = deriveSpatialQuietness({
    cognitiveLoad: signals.cognitiveLoad,
    stressPressure: signals.stressPressure,
    fatigueLevel: signals.fatigueLevel,
    energyQuietness: signals.energyQuietness,
    strainBlend,
  })

  const environmentSoftness = blendEnvironmentSoftness({
    baseSoftness: signals.environmentSoftnessBase,
    ambientPresence,
    strainBlend,
    workflowCalm: signals.workflowCalm,
  })

  const livingGlass = deriveLivingGlass({
    ambientPresence,
    materialStillness,
    strainBlend,
  })

  return {
    ambientPresence,
    materialStillness,
    environmentSoftness,
    spatialQuietness,
    livingGlass,
  }
}

function applyPresenceTokens(d: AmbientPresenceDerived) {
  const root = document.documentElement
  root.style.setProperty('--ambient-presence', d.ambientPresence.toFixed(3))
  root.style.setProperty('--material-stillness', d.materialStillness.toFixed(3))
  root.style.setProperty('--environment-softness', d.environmentSoftness.toFixed(3))
  root.style.setProperty('--spatial-quietness', d.spatialQuietness.toFixed(3))
  root.style.setProperty('--living-glass', d.livingGlass.toFixed(3))

  /** Compound edge clarity — atmospheric simplification only (glassStyles consumes --spatial-quietness too). */
  const baseEdge = readVar('--light-edge-clarity', 1)
  const edge = clamp(baseEdge * (1 - d.spatialQuietness * 0.11), 0.74, 1)
  root.style.setProperty('--light-edge-clarity', edge.toFixed(3))
}

export type AmbientPresenceLayerInput = {
  /** Output.environmentSoftness from `computeLightEnvironment` / `applyLightEnvironment` */
  environmentSoftnessBase: number
}

/**
 * Final atmospheric layer — run after cognitive, emotional, flow, and energy updates.
 */
export function applyAmbientPresenceLayer(input: AmbientPresenceLayerInput) {
  const cognitiveLoad = useCognitiveUI.getState().policy.load
  const flow = useFlowIntel.getState().bundle
  const energy = useEnergyIntel.getState().snapshot
  const emotional = useEmotionalSafetyIntel.getState().bundle
  const tel = useInteractionTelemetry.getState()
  const behavioral = useBehavioralIntel.getState()

  const nowMs = Date.now()
  const churn = computeTransitionChurn(behavioral.transitions, nowMs)
  const continuityBias = deriveEnvironmentalContinuity({
    navBurst: tel.navBurst,
    transitionChurn: churn,
  })

  const derived = deriveAmbientPresence({
    cognitiveLoad,
    flowMomentum: flow?.flowMomentum ?? 0,
    workflowCalm: flow?.workflowCalm ?? 0,
    fatigueLevel: energy?.fatigueLevel ?? 0.34,
    stressPressure: emotional?.stressPressure ?? 0,
    energyQuietness: energy?.energyQuietness ?? 0.28,
    mentalQuietness: readVar('--mental-quietness', 0),
    ambientQuietness: readVar('--ambient-quietness', 0),
    environmentSoftnessBase: input.environmentSoftnessBase,
    navBurst: tel.navBurst,
    continuityBias,
    hourOfDay: new Date().getHours(),
  })

  applyPresenceTokens(derived)
}
