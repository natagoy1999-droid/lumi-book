function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function breathingIntensity(args: {
  dominantScore: number
  pressure: number // 0..1
}): number {
  const { dominantScore, pressure } = args
  const urgent = dominantScore >= 85 ? 1 : dominantScore >= 70 ? 0.65 : 0.25
  // urgent -> more stillness -> less breathing
  const stillness = clamp(pressure * 0.75 + urgent * 0.55, 0, 1)
  return clamp(1 - stillness * 0.92, 0.08, 1)
}

export function stillnessLevel(args: { dominantScore: number; pressure: number }) {
  const { dominantScore, pressure } = args
  const urgent = dominantScore >= 85 ? 1 : dominantScore >= 70 ? 0.65 : 0.25
  return clamp(pressure * 0.8 + urgent * 0.55, 0, 1)
}

export function getVarNumber(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw.replace('px', '').replace('ms', ''))
  return Number.isFinite(n) ? n : fallback
}

