function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function dominantOpacity(t: number) {
  // new dominant 0.92 -> 1.0
  const x = clamp(t, 0, 1)
  return lerp(0.92, 1.0, x)
}

export function oldDominantOpacity(t: number) {
  // old dominant 1.0 -> 0.92
  const x = clamp(t, 0, 1)
  return lerp(1.0, 0.92, x)
}

export function secondaryDim(t: number) {
  // secondary: first slightly dim, then recover
  const x = clamp(t, 0, 1)
  if (x < 0.35) return lerp(1.0, 0.94, x / 0.35)
  return lerp(0.94, 1.0, (x - 0.35) / 0.65)
}

