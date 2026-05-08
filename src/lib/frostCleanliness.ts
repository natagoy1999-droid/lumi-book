function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type FrostCleanliness = {
  cleanliness: number // 0..1 (1 = clean, less frost)
  frostMul: number
  noiseMul: number
}

export function frostCleanliness(args: {
  attentionLock: number // 0..1
  motionQuietness: number // 0..1
  materialDepth: number // 0..1
}): FrostCleanliness {
  const lock = clamp(args.attentionLock, 0, 1)
  const quiet = clamp(args.motionQuietness, 0, 1)
  const depth = clamp(args.materialDepth, 0, 1)

  // Lock + quiet -> cleaner. Depth -> slightly less clean.
  const cleanliness = clamp(1 - lock * 0.55 - quiet * 0.28 - depth * 0.12, 0.35, 1)
  const frostMul = clamp(0.75 + (1 - cleanliness) * 0.35, 0.75, 1.1)
  const noiseMul = clamp(0.72 + (1 - cleanliness) * 0.45, 0.72, 1.15)

  return { cleanliness, frostMul, noiseMul }
}

