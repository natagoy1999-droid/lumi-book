function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type ContextPrewarmInput = {
  workflowContinuity: number
  intentStability: number
  pathnameMatchesSessionPrimary: boolean
}

/**
 * Warm continuity — invisible; never shows loaders or “AI preparing”.
 */
export function deriveContextPrewarm(input: ContextPrewarmInput): number {
  return clamp(
    input.workflowContinuity * 0.46 +
      input.intentStability * 0.38 +
      (input.pathnameMatchesSessionPrimary ? 0.16 : 0),
    0,
    1,
  )
}
