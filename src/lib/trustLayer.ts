import {
  computeUnifiedAIConfidence,
  dockBoostTrustMultiplier,
  gatedBehavioralReadiness,
  type ConfidenceSignals,
} from './confidenceEngine'
import { useTrustIntel } from '../state/trustIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type TrustLayerInput = ConfidenceSignals

/**
 * Trust & confidence tokens — visibility and predictive weight stay user-respecting.
 */
export function applyTrustLayerTokens(input: TrustLayerInput) {
  const ai = computeUnifiedAIConfidence(input)
  const sup = clamp(input.trustSuppression, 0, 1)
  const load = clamp(input.cognitiveLoad, 0, 1)

  const assistantPresence = clamp(0.28 + ai * 0.62 - sup * 0.38 - load * 0.12, 0.08, 0.96)
  const predictiveOpacity = clamp(0.22 + ai * 0.58 - sup * 0.35, 0.12, 0.9)
  const anticipationQuietness = clamp(0.18 + sup * 0.52 + load * 0.24 + (1 - ai) * 0.12, 0, 1)
  const trustWeight = clamp(0.28 + ai * (1 - sup * 0.82), 0.18, 1)

  const readinessRaw = input.behavioral.behavioralReadiness
  const readinessGated = gatedBehavioralReadiness(readinessRaw, ai)

  const root = document.documentElement
  root.style.setProperty('--ai-confidence', ai.toFixed(3))
  root.style.setProperty('--assistant-presence', assistantPresence.toFixed(3))
  root.style.setProperty('--predictive-opacity', predictiveOpacity.toFixed(3))
  root.style.setProperty('--anticipation-quietness', anticipationQuietness.toFixed(3))
  root.style.setProperty('--trust-weight', trustWeight.toFixed(3))

  root.style.setProperty('--behavioral-readiness', readinessGated.toFixed(3))

  const dockMul = dockBoostTrustMultiplier(ai)
  useTrustIntel.getState().setTrustOutputs({
    ai,
    dockMul,
    anticipationQuiet: anticipationQuietness,
  })

  return {
    aiConfidence: ai,
    trustWeight,
    dockBoostMultiplier: dockMul,
    anticipationQuietness,
    assistantPresence,
    predictiveOpacity,
  }
}
