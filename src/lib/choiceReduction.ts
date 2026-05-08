function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type ChoicePressureInput = {
  cognitiveLoad: number
  pendingConfirm: number
  reschedulePending: number
  remindersCount: number
  navBurst: number
  scrollEwma: number
  dockActionCount: number
  stressPressure: number
}

/**
 * Competing micro-decisions + unfinished loops — numeric only, no automation.
 */
export function computeChoicePressure(input: ChoicePressureInput): number {
  const unfinished = clamp((input.pendingConfirm + input.reschedulePending * 0.88) / 7.5, 0, 1)
  const reminderNoise = clamp(input.remindersCount / 11, 0, 1)
  const ctaCompetition = clamp(input.dockActionCount / 4.6, 0, 1)
  const switching = clamp(input.navBurst / 7.5, 0, 1)
  const scrollChurn = clamp((input.scrollEwma - 72) / 2300, 0, 1)
  return clamp(
    unfinished * 0.26 +
      reminderNoise * 0.13 +
      ctaCompetition * 0.18 +
      switching * 0.2 +
      scrollChurn * 0.09 +
      input.cognitiveLoad * 0.21 +
      input.stressPressure * 0.17,
    0,
    1,
  )
}
