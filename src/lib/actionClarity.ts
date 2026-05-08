function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type ActionClarityInput = {
  choicePressure: number
  cognitiveLoad: number
  stressPressure: number
  dominantScore: number
  workflowCalm: number
  flowMomentum: number
}

export type ActionClarityBundle = {
  decisionClarity: number
  actionFocus: number
  secondaryQuietness: number
}

/** Calm clarity — readable primary, quieter secondaries (never shouty). */
export function deriveActionClarityBundle(input: ActionClarityInput): ActionClarityBundle {
  const scoreLift =
    input.dominantScore >= 84 ? 0.055 : input.dominantScore >= 76 ? 0.03 : 0

  const decisionClarity = clamp(
    0.36 +
      (1 - input.choicePressure) * 0.44 +
      input.workflowCalm * 0.17 +
      scoreLift -
      input.stressPressure * 0.13 -
      input.cognitiveLoad * 0.11,
    0.16,
    0.94,
  )

  const actionFocus = clamp(
    0.43 +
      (1 - input.choicePressure) * 0.38 +
      input.flowMomentum * 0.13 -
      input.stressPressure * 0.11 -
      input.cognitiveLoad * 0.08,
    0.24,
    0.93,
  )

  const secondaryQuietness = clamp(
    0.2 +
      input.choicePressure * 0.4 +
      input.cognitiveLoad * 0.27 +
      input.stressPressure * 0.21,
    0,
    1,
  )

  return { decisionClarity, actionFocus, secondaryQuietness }
}
