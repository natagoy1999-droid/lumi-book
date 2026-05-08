function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type FocusLinearityInput = {
  cognitiveLoad: number
  stressPressure: number
  choicePressure: number
  workflowCalm: number
  pathname: string
}

/**
 * Prefer a calm linear “next step” feeling under pressure — no wizard, scalar only.
 */
export function deriveFocusLinearity(input: FocusLinearityInput): number {
  const routeScatter = input.pathname === '/today' ? 0 : 0.07
  const calmDrift = (1 - input.workflowCalm) * 0.2
  return clamp(
    input.cognitiveLoad * 0.33 +
      input.stressPressure * 0.27 +
      input.choicePressure * 0.26 +
      calmDrift +
      routeScatter,
    0,
    1,
  )
}
