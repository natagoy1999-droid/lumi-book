function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type FrostVars = {
  frostOpacity: number
  surfaceNoise: number
}

export function frostNoise(args: {
  materialDepth: number // 0..1
  attentionLock: number // 0..1
}): FrostVars {
  const d = clamp(args.materialDepth, 0, 1)
  const lock = clamp(args.attentionLock, 0, 1)

  // Secondary farther -> slightly more frost; attention lock -> slightly less (cleaner for focus).
  const frostOpacity = clamp(0.02 + d * 0.045 - lock * 0.012, 0.012, 0.06)
  const surfaceNoise = clamp(0.03 + d * 0.06 - lock * 0.016, 0.02, 0.09)

  return { frostOpacity, surfaceNoise }
}

