function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function settleAmplitudePx(args: {
  basePx: number
  stillness: number // 0..1 (1 = more still)
}) {
  const { basePx, stillness } = args
  // Stillness reduces settle amplitude; never exceed 1px.
  return clamp(basePx * (1 - stillness * 0.55), 0.3, 1.0)
}

export function settleKeyframes(amplitudePx: number) {
  // Tiny premium settle: up → micro down → rest
  const a = clamp(amplitudePx, 0, 1)
  return [0, -a, a * 0.25, 0]
}

