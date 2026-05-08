import { deriveAssistanceOrchestration } from './assistanceTiming'
import { derivePauseSoftness } from './pauseDetection'
import { deriveInteractionTimingQuality, deriveUrgencyProximity } from './timingAwareness'
import type { WorkflowIntentModel } from './workflowIntent'
import type { FlowStateBundle } from '../state/flowIntel'

import { usePredictiveIntel } from '../state/predictiveIntel'
import { useTemporalIntel } from '../state/temporalIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export type TemporalIntelligenceLayerInput = {
  flowBundle: FlowStateBundle
  navBurst: number
  scrollEwma: number
  eventTimestampsMs: readonly number[]
  lastInteractionTs: number
  cognitiveLoad: number
  fatigueLevel: number
  stressPressure: number
  trustSuppression: number
  intentModel: WorkflowIntentModel
  dominantScore: number
  minutesToNext?: number
}

/**
 * Temporal orchestration — when to soften/defer assistance; never notification-style nudging.
 */
export function applyTemporalIntelligenceLayer(input: TemporalIntelligenceLayerInput) {
  const nowMs = Date.now()

  const pauseSoftness = derivePauseSoftness({
    eventTimestampsMs: input.eventTimestampsMs,
    lastInteractionTs: input.lastInteractionTs,
    nowMs,
  })

  const interactionTiming = deriveInteractionTimingQuality({
    navBurst: input.navBurst,
    scrollEwma: input.scrollEwma,
    flowMomentum: input.flowBundle.flowMomentum,
    interactionFlow: input.flowBundle.interactionFlow,
    cognitiveLoad: input.cognitiveLoad,
  })

  const urgencyProximity = deriveUrgencyProximity({
    dominantScore: input.dominantScore,
    minutesToNext: input.minutesToNext,
  })

  const predictiveReadiness =
    usePredictiveIntel.getState().snapshot?.predictiveReadiness ?? readVar('--predictive-readiness', 0.42)

  const orch = deriveAssistanceOrchestration({
    pauseSoftness,
    interactionTiming,
    workflowCalm: input.flowBundle.workflowCalm,
    flowMomentum: input.flowBundle.flowMomentum,
    focusContinuity: input.flowBundle.focusContinuity,
    cognitiveLoad: input.cognitiveLoad,
    fatigueLevel: input.fatigueLevel,
    stressPressure: input.stressPressure,
    trustSuppression: input.trustSuppression,
    intentConfidence: input.intentModel.confidence,
    urgencyProximity,
    navBurst: input.navBurst,
    predictiveReadiness,
  })

  const root = document.documentElement
  root.style.setProperty('--timing-readiness', orch.timingReadiness.toFixed(3))
  root.style.setProperty('--interaction-timing', interactionTiming.toFixed(3))
  root.style.setProperty('--pause-softness', pauseSoftness.toFixed(3))
  root.style.setProperty('--temporal-quietness', orch.temporalQuietness.toFixed(3))
  root.style.setProperty('--assistance-window', orch.assistanceWindow.toFixed(3))

  let ap = readVar('--assistant-presence', 0.55)
  ap = clamp(ap * (1 - orch.temporalQuietness * 0.36), 0.05, 0.96)
  root.style.setProperty('--assistant-presence', ap.toFixed(3))

  useTemporalIntel.getState().setSnapshot({
    timingReadiness: orch.timingReadiness,
    interactionTiming,
    pauseSoftness,
    temporalQuietness: orch.temporalQuietness,
    assistanceWindow: orch.assistanceWindow,
    proactiveSuppression: orch.proactiveSuppression,
  })
}
