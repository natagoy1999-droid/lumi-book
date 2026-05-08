import { absDelta, clamp01, readVarNumber } from './coherencePhysics'

export type CrossLayerHarmonySnapshot = {
  systemCoherence: number
  behavioralStability: number
  environmentContinuity: number
  operationalHarmony: number
  coherenceDamping: number
}

export function deriveCrossLayerHarmony(): CrossLayerHarmonySnapshot {
  // Priority order (when conflicts): emotional safety → continuity → calmness → clarity → assistance
  const stress = readVarNumber('--stress-pressure', 0)
  const calmAssist = readVarNumber('--calm-assistance', 1)
  const workflowContinuity = readVarNumber('--workflow-continuity', 0.5)
  const sessionCalm = readVarNumber('--session-calm', 0.72)
  const flowMomentum = readVarNumber('--flow-momentum', 0)
  const workflowCalm = readVarNumber('--workflow-calm', 0)
  const intentConfidence = readVarNumber('--intent-confidence', 0.45)
  const predictiveReadiness = readVarNumber('--predictive-readiness', 0.42)
  const socialQuietness = readVarNumber('--social-quietness', 0.35)
  const interactionTiming = readVarNumber('--interaction-timing', 0.48)
  const temporalQuietness = readVarNumber('--temporal-quietness', 0.32)
  const presenceFamiliarity = readVarNumber('--presence-familiarity', 0)
  const ambientPresence = readVarNumber('--ambient-presence', 0.42)
  const systemStillness = readVarNumber('--system-stillness', 0)
  const decisionClarity = readVarNumber('--decision-clarity', 0.62)
  const choicePressure = readVarNumber('--choice-pressure', 0.34)
  const navBurst = clamp01(readVarNumber('--interaction-pressure', 0)) // sometimes used as composite; fallback ok

  // Conflicts (0..1): higher means more conflict
  const c1_assistanceVsQuiet = clamp01(
    absDelta(1 - temporalQuietness, predictiveReadiness) * 0.55 +
      absDelta(1 - socialQuietness, predictiveReadiness) * 0.35 +
      absDelta(1 - stress, predictiveReadiness) * 0.25,
  )
  const c2_intentVsFlow = clamp01(absDelta(intentConfidence, workflowCalm) * 0.55 + absDelta(intentConfidence, flowMomentum) * 0.35)
  const c3_clarityVsPressure = clamp01(absDelta(decisionClarity, 1 - choicePressure) * 0.65)
  const c4_stillnessVsBurst = clamp01(absDelta(systemStillness, navBurst) * 0.55)
  const conflict = clamp01(c1_assistanceVsQuiet * 0.34 + c2_intentVsFlow * 0.24 + c3_clarityVsPressure * 0.24 + c4_stillnessVsBurst * 0.18)

  const safety = clamp01((1 - stress) * 0.65 + calmAssist * 0.35)
  const continuity = clamp01(workflowContinuity * 0.62 + sessionCalm * 0.38)
  const calmness = clamp01(workflowCalm * 0.52 + (1 - navBurst) * 0.18 + (1 - stress) * 0.3)
  const clarity = clamp01(decisionClarity * 0.72 + (1 - choicePressure) * 0.28)
  const assistance = clamp01((1 - temporalQuietness) * 0.55 + predictiveReadiness * 0.35 + interactionTiming * 0.1)

  // Harmony favors priorities under conflict.
  const operationalHarmony = clamp01(
    safety * 0.3 +
      continuity * 0.26 +
      calmness * 0.18 +
      clarity * 0.14 +
      assistance * 0.12 -
      conflict * 0.22,
  )

  const environmentContinuity = clamp01(
    ambientPresence * 0.28 +
      (1 - temporalQuietness) * 0.16 +
      (1 - socialQuietness) * 0.1 +
      continuity * 0.3 +
      presenceFamiliarity * 0.16,
  )

  const behavioralStability = clamp01(
    (1 - conflict) * 0.44 +
      continuity * 0.2 +
      (1 - navBurst) * 0.14 +
      (1 - choicePressure) * 0.12 +
      presenceFamiliarity * 0.1,
  )

  const systemCoherence = clamp01(
    operationalHarmony * 0.52 +
      behavioralStability * 0.2 +
      environmentContinuity * 0.2 -
      conflict * 0.18,
  )

  // More conflict / less familiarity → more damping.
  const coherenceDamping = clamp01(0.18 + conflict * 0.58 + (1 - presenceFamiliarity) * 0.12 + stress * 0.12)

  return {
    systemCoherence,
    behavioralStability,
    environmentContinuity,
    operationalHarmony,
    coherenceDamping,
  }
}

