function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type PauseDetectionInput = {
  eventTimestampsMs: readonly number[]
  lastInteractionTs: number
  nowMs: number
}

/**
 * Natural pause softness — best moments for quiet hints are subtle gaps, not “waiting for pause”.
 */
export function derivePauseSoftness(input: PauseDetectionInput): number {
  const idle = Math.max(0, input.nowMs - input.lastInteractionTs)

  let idleScore = 0.38
  if (idle >= 900 && idle < 52_000) idleScore = 0.72 + clamp((idle - 900) / 48_000, 0, 1) * 0.18
  else if (idle < 650) idleScore = 0.18 + clamp(idle / 650, 0, 1) * 0.18

  const recent = [...input.eventTimestampsMs].filter((t) => input.nowMs - t <= 42_000)
  if (recent.length < 3) return clamp(idleScore * 0.92, 0, 1)

  const sorted = recent.sort((a, b) => a - b)
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) gaps.push(sorted[i] - sorted[i - 1])
  gaps.sort((a, b) => a - b)
  const med = gaps[Math.floor(gaps.length / 2)] ?? 1400
  const rhythm = clamp(1 - Math.abs(Math.log(Math.max(320, med) / 1100)) / 2.4, 0, 1)

  return clamp(idleScore * 0.58 + rhythm * 0.42, 0, 1)
}
