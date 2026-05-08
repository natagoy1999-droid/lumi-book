function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type GlassTemp = {
  warmRgb: string // "r g b"
  coldRgb: string
  mix: number // 0..1 (1 = warmer)
}

export function glassTemperature(args: { focusContrast: number; depthPriority: number }): GlassTemp {
  const fc = clamp(args.focusContrast, 0, 1)
  const dp = clamp(args.depthPriority, 0, 1)

  // Warmer when focused, colder when deeper/secondary.
  const mix = clamp(0.35 + fc * 0.55 + dp * 0.25, 0, 1)

  return {
    warmRgb: '214 198 140', // champagne
    coldRgb: '255 255 255', // cold glass
    mix,
  }
}

