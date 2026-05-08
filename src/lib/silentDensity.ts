function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Silent density — perceived informational density without visible “squeeze”.
 */
export function deriveQuietDensity(cognitiveLoad: number): number {
  return clamp(0.2 + cognitiveLoad * 0.58, 0.16, 0.92)
}

export function applySilentDensity(cognitiveLoad: number) {
  document.documentElement.style.setProperty(
    '--quiet-density',
    deriveQuietDensity(cognitiveLoad).toFixed(3),
  )
}
