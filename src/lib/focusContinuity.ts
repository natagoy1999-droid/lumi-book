function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Focus continuity — stable attention band when flow rises and pressure falls.
 */
export function computeFocusContinuity(
  flowMomentum: number,
  stressPressure: number,
  cognitiveLoad: number,
): number {
  const calm = (1 - stressPressure) * (1 - cognitiveLoad * 0.35)
  return clamp(flowMomentum * 0.62 + calm * 0.38, 0, 1)
}
