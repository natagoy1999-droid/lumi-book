import { computePreparedComposerAmbient, derivePreparedFlowStrength } from './preparedActions'
import { deriveContextPrewarm } from './contextPrewarming'
import { deriveFrictionEvaporation } from './frictionEvaporation'
import type { WorkflowIntentModel } from './workflowIntent'

import { usePredictiveIntel } from '../state/predictiveIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export type PredictiveCalmLayerInput = {
  intentModel: WorkflowIntentModel
  workflowContinuity: number
  pathnameMatchesSessionPrimary: boolean
  cognitiveLoad: number
  aiConfidence: number
  workflowCalm: number
  navBurst: number
  scrollEwma: number
  stressPressure: number
  trustSuppression: number
}

function applyAutomationTokens(args: {
  predictiveReadiness: number
  preparedFlow: number
  frictionEvaporation: number
  calmAcceleration: number
  workflowReadiness: number
}) {
  const root = document.documentElement
  root.style.setProperty('--predictive-readiness', args.predictiveReadiness.toFixed(3))
  root.style.setProperty('--prepared-flow', args.preparedFlow.toFixed(3))
  root.style.setProperty('--friction-evaporation', args.frictionEvaporation.toFixed(3))
  root.style.setProperty('--calm-acceleration', args.calmAcceleration.toFixed(3))
  root.style.setProperty('--workflow-readiness', args.workflowReadiness.toFixed(3))
}

/**
 * Predictive calm automation — reduces felt friction before it registers; never auto-sends or navigates.
 */
export function applyPredictiveCalmLayer(input: PredictiveCalmLayerInput) {
  const prewarm = deriveContextPrewarm({
    workflowContinuity: input.workflowContinuity,
    intentStability: input.intentModel.stability,
    pathnameMatchesSessionPrimary: input.pathnameMatchesSessionPrimary,
  })

  const friction = deriveFrictionEvaporation({
    navBurst: input.navBurst,
    scrollEwma: input.scrollEwma,
    cognitiveLoad: input.cognitiveLoad,
    intentConfidence: input.intentModel.confidence,
    intentStability: input.intentModel.stability,
    workflowCalm: input.workflowCalm,
  })

  let readiness =
    input.intentModel.confidence *
    input.intentModel.stability *
    clamp(input.aiConfidence, 0.08, 1) *
    (0.62 + prewarm * 0.38) *
    (1 - input.cognitiveLoad * 0.4) *
    (1 - clamp(input.trustSuppression, 0, 1) * 0.52)

  if (input.intentModel.primary === 'neutral') readiness *= 0.38
  readiness = clamp(readiness, 0, 1)

  if (input.intentModel.confidence < 0.34) readiness *= 0.45

  const preparedFlow = derivePreparedFlowStrength(readiness, input.intentModel.confidence)

  const calmAcceleration = clamp(
    input.workflowCalm * 0.44 +
      readiness * 0.34 +
      friction * 0.26 -
      input.stressPressure * 0.2,
    0,
    1,
  )

  const workflowReadiness = clamp(
    preparedFlow * 0.52 +
      input.intentModel.activeIntentStrength *
        input.intentModel.stability *
        (0.35 + readiness * 0.13),
    0,
    1,
  )

  applyAutomationTokens({
    predictiveReadiness: readiness,
    preparedFlow,
    frictionEvaporation: friction,
    calmAcceleration,
    workflowReadiness,
  })

  const ambient = computePreparedComposerAmbient({
    primaryIntent: input.intentModel.primary,
    predictiveReadiness: readiness,
    intentConfidence: input.intentModel.confidence,
    cognitiveLoad: input.cognitiveLoad,
    trustSuppression: input.trustSuppression,
    communicationSoftness: readVar('--communication-softness', 0.52),
    followupDelicacy: readVar('--followup-delicacy', 0.55),
  })

  usePredictiveIntel.getState().setPredictive(
    {
      predictiveReadiness: readiness,
      preparedFlow,
      frictionEvaporation: friction,
      calmAcceleration,
      workflowReadiness,
    },
    ambient ? { line: ambient.line } : null,
  )
}
