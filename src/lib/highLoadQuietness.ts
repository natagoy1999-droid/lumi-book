function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * High-load quietness controller — lowers decorative energy (CSS-driven, no compounding into other pipelines).
 */
export function deriveAmbientQuietness(cognitiveLoad: number, mentalQuietness: number): number {
  return clamp(cognitiveLoad * 0.56 + mentalQuietness * 0.34, 0, 1)
}

export function applyHighLoadQuietnessVars(input: {
  cognitiveLoad: number
  mentalQuietness: number
}) {
  const aq = deriveAmbientQuietness(input.cognitiveLoad, input.mentalQuietness)
  document.documentElement.style.setProperty('--ambient-quietness', aq.toFixed(3))
}
