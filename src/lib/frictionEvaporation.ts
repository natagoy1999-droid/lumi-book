function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type FrictionEvaporationInput = {
  navBurst: number
  scrollEwma: number
  cognitiveLoad: number
  intentConfidence: number
  intentStability: number
  workflowCalm: number
}

/**
 * How much operational friction is quietly dissolving — higher is better (no “speed” framing).
 */
export function deriveFrictionEvaporation(input: FrictionEvaporationInput): number {
  const churn =
    clamp(input.navBurst / 8.2, 0, 1) * 0.38 + clamp((input.scrollEwma - 68) / 2400, 0, 1) * 0.28
  const calmPath =
    input.workflowCalm * 0.28 + input.intentConfidence * input.intentStability * 0.38
  return clamp(calmPath * (1 - churn * 0.52) * (1 - input.cognitiveLoad * 0.34), 0, 1)
}
