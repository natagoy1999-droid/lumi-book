function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type ColdGlass = {
  coldTintRgb: string // "r g b"
  distance: number // 0..1
  secondaryAlphaMul: number
  secondaryBorderSoftness: number // 0..1 (higher = softer/lower opacity)
}

export function coldGlass(args: { materialDepth: number; attentionLock: number }): ColdGlass {
  const d = clamp(args.materialDepth, 0, 1)
  const lock = clamp(args.attentionLock, 0, 1)

  // “Distance” increases when depth is higher and lock is on.
  const distance = clamp(d * 0.75 + lock * 0.35, 0, 1)

  return {
    coldTintRgb: '236 242 255', // very subtle cool
    distance,
    secondaryAlphaMul: clamp(1 - distance * 0.10, 0.84, 1),
    secondaryBorderSoftness: clamp(distance, 0, 1),
  }
}

