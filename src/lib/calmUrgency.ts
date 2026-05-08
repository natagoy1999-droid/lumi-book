function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type CalmUrgency = {
  stillness: number // 0..1
  focusLock: number // 0..1
  motionQuietness: number // 0..1
  staggerReduction: number // 0..1 (1 = almost no stagger)
  urgencyDensity: number // 0..1 (lower = denser)
}

export function computeCalmUrgency(args: {
  minutesToNext?: number
  dominantScore: number
  pressure: number
}): CalmUrgency {
  const { minutesToNext, dominantScore, pressure } = args

  const urgentByTime =
    typeof minutesToNext === 'number'
      ? minutesToNext <= 40
        ? 1
        : minutesToNext <= 75
          ? 0.55
          : 0.15
      : 0.1

  const urgentByScore = dominantScore >= 85 ? 1 : dominantScore >= 70 ? 0.6 : 0.25
  const urgent = clamp(urgentByTime * 0.7 + urgentByScore * 0.3, 0, 1)

  const stillness = clamp(pressure * 0.55 + urgent * 0.75, 0, 1)
  const focusLock = clamp(urgent * 0.8 + pressure * 0.35, 0, 1)

  // Quietness fades motion, not content.
  const motionQuietness = clamp(stillness * 0.9, 0, 1)

  // Reduce stagger heavily when truly urgent, but keep tiny mass.
  const staggerReduction = clamp(urgentByTime >= 1 ? 0.92 : stillness * 0.55, 0, 0.92)

  // Denser scanning under urgency (but calm): 1 -> 0.86
  const urgencyDensity = clamp(1 - stillness * 0.14, 0.86, 1)

  return { stillness, focusLock, motionQuietness, staggerReduction, urgencyDensity }
}

