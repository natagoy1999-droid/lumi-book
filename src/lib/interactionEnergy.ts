import { computeChaoticBurstPressure, computeIdleReturnBias } from './fatigueDetection'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type InteractionEnergyInput = {
  eventTimestampsMs: readonly number[]
  typingIntervalsEwmaMs: number
  composerToggleTimestampsMs: readonly number[]
  navBurst: number
  fatigueLevel: number
  lastInteractionTs: number
  nowMs: number
}

function medianDelta(sortedTs: number[]): number {
  if (sortedTs.length < 3) return 2800
  const deltas: number[] = []
  for (let i = 1; i < sortedTs.length; i++) deltas.push(sortedTs[i] - sortedTs[i - 1])
  deltas.sort((a, b) => a - b)
  return deltas[Math.floor(deltas.length / 2)] ?? 1600
}

/** Rapid open/close churn without sending — drains “confidence energy”. */
function composerRetryPressure(toggles: readonly number[], nowMs: number): number {
  const win = 42_000
  const recent = toggles.filter((t) => nowMs - t <= win)
  if (recent.length < 4) return 0
  return clamp((recent.length - 4) / 10, 0, 1)
}

/** Typing rhythm variance proxy — steady typing suggests engaged flow. */
function typingSteadiness(typingEwmaMs: number): number {
  if (typingEwmaMs <= 0 || typingEwmaMs > 8000) return 0.35
  return clamp(1 - Math.abs(Math.log(Math.max(120, typingEwmaMs) / 420)) / 2.2, 0, 1)
}

/**
 * Interaction energy 0..1 — confident, steady pace without chaos or fatigue drag.
 * Not “mood”; operational throughput the UI can mirror subtly.
 */
export function deriveInteractionEnergy(input: InteractionEnergyInput): number {
  const now = input.nowMs
  const recent = [...input.eventTimestampsMs].filter((t) => now - t <= 52_000).sort((a, b) => a - b)
  const md = medianDelta(recent)
  /** Fast but not frantic median gaps → higher pace score */
  const paceScore = clamp((2400 - md) / 2100, 0, 1)
  const chaos = computeChaoticBurstPressure(input.eventTimestampsMs, now)
  const retry = composerRetryPressure(input.composerToggleTimestampsMs, now)
  const idleBias = computeIdleReturnBias(input.lastInteractionTs, now)
  const typing = typingSteadiness(input.typingIntervalsEwmaMs)

  let e =
    paceScore * 0.44 +
    typing * 0.18 +
    (1 - chaos) * 0.22 +
    (1 - clamp(input.navBurst / 6.5, 0, 1)) * 0.1 -
    input.fatigueLevel * 0.38 -
    retry * 0.24 -
    idleBias * 0.08

  e = clamp(e, 0, 1)
  /** Never fully collapse from single spike — humane OS baseline */
  return clamp(e * 0.92 + 0.08, 0, 1)
}

/**
 * Instant stabilization signal after chaotic bursts — smoothed in `energyAware` (no user-facing label).
 */
export function computeFocusRecoveryInstant(navBurst: number, chaoticBurst: number): number {
  return clamp(navBurst / 6.2 * 0.52 + chaoticBurst * 0.48, 0, 1)
}
