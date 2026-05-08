import { computeInteractionFatigue } from './interactionFatigue'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type FatigueDetectionInput = {
  scrollEwma: number
  navBurst: number
  composerOpens: number[]
  /** Recent interaction events for chaotic bursts */
  eventTimestampsMs: readonly number[]
  nowMs: number
}

/**
 * Circadian softness only — no wellness framing; informs visual calm late-day.
 */
export function computeEveningBias(nowMs: number): number {
  const h = new Date(nowMs).getHours()
  if (h >= 23 || h < 5) return 0.42
  if (h >= 21) return 0.28
  if (h >= 19) return 0.14
  return 0
}

/** Chaotic micro-burst: many distinct touches in a short window (no moralizing copy). */
export function computeChaoticBurstPressure(eventTimestampsMs: readonly number[], nowMs: number): number {
  const windowMs = 14_000
  const recent = eventTimestampsMs.filter((t) => nowMs - t <= windowMs)
  if (recent.length < 9) return 0
  const sorted = [...recent].sort((a, b) => a - b)
  let flips = 0
  for (let i = 2; i < sorted.length; i++) {
    const a = sorted[i - 2]
    const b = sorted[i - 1]
    const c = sorted[i]
    if (c - b < 380 && b - a < 380) flips++
  }
  const density = clamp((recent.length - 8) / 14, 0, 1)
  return clamp(density * 0.62 + clamp(flips / 10, 0, 1) * 0.38, 0, 1)
}

/** Long idle then sudden burst → slight stabilization preference (handled upstream). */
export function computeIdleReturnBias(lastInteractionTs: number, nowMs: number): number {
  const idle = nowMs - lastInteractionTs
  if (idle > 8 * 60_000 && idle < 72 * 60 * 60_000) return clamp((idle - 8 * 60_000) / (45 * 60_000), 0, 0.35)
  return 0
}

/**
 * Unified fatigue 0..1 — interaction churn + evening + chaos (still feels like OS tuning, not mood tracking).
 */
export function computeFatigueLevel(input: FatigueDetectionInput): number {
  const interactionFatigue = computeInteractionFatigue({
    scrollEwma: input.scrollEwma,
    navBurst: input.navBurst,
    composerOpens: input.composerOpens,
  })
  const evening = computeEveningBias(input.nowMs)
  const chaos = computeChaoticBurstPressure(input.eventTimestampsMs, input.nowMs)
  return clamp(interactionFatigue * 0.58 + evening * 0.22 + chaos * 0.2, 0, 1)
}
