import { computeEveningBias } from './fatigueDetection'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type AssistanceOrchestrationInput = {
  pauseSoftness: number
  interactionTiming: number
  workflowCalm: number
  flowMomentum: number
  focusContinuity: number
  cognitiveLoad: number
  fatigueLevel: number
  stressPressure: number
  trustSuppression: number
  intentConfidence: number
  urgencyProximity: number
  navBurst: number
  predictiveReadiness: number
}

export type AssistanceOrchestration = {
  assistanceWindow: number
  temporalQuietness: number
  proactiveSuppression: number
  timingReadiness: number
}

/**
 * When to defer / soften assistance — continuity beats interruption in deep flow.
 */
export function deriveAssistanceOrchestration(input: AssistanceOrchestrationInput): AssistanceOrchestration {
  const evening = computeEveningBias(Date.now())

  const chaos = clamp(input.navBurst / 8.2, 0, 1) * 0.38 + input.stressPressure * 0.22

  let assistanceWindow = clamp(
    input.pauseSoftness * 0.34 +
      input.interactionTiming * 0.28 +
      input.workflowCalm * 0.18 +
      (1 - chaos) * 0.16 -
      input.urgencyProximity * 0.34 -
      evening * 0.12 -
      input.trustSuppression * 0.14,
    0,
    1,
  )

  /** Deep flow → continuity > proactive assistance */
  const deepFlow = clamp(input.flowMomentum * 0.55 + input.focusContinuity * 0.35, 0, 1)
  assistanceWindow *= 1 - deepFlow * (0.38 + input.workflowCalm * 0.12)

  const temporalQuietness = clamp(
    chaos * 0.28 +
      input.fatigueLevel * 0.22 +
      evening * 0.18 +
      input.stressPressure * 0.18 +
      (1 - assistanceWindow) * 0.28 +
      input.cognitiveLoad * 0.14,
    0,
    1,
  )

  const proactiveSuppression = clamp(
    deepFlow * 0.32 +
      chaos * 0.24 +
      input.urgencyProximity * 0.26 +
      (1 - input.pauseSoftness) * 0.14 +
      input.fatigueLevel * 0.16 -
      input.intentConfidence * input.predictiveReadiness * 0.08,
    0,
    1,
  )

  const timingReadiness = clamp(
    assistanceWindow * 0.42 +
      input.interactionTiming * 0.28 +
      input.pauseSoftness * 0.22 -
      temporalQuietness * 0.18,
    0,
    1,
  )

  return { assistanceWindow, temporalQuietness, proactiveSuppression, timingReadiness }
}
