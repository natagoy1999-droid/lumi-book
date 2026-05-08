function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/** Scalar warmth bias for glass (not a theme swap — ambient tint strength). */
export function computeGlassWarmth(args: {
  calm: boolean
  evening: number // 0..1
  attentionLock: number
}): number {
  const lock = clamp(args.attentionLock, 0, 1)
  return clamp(
    (args.calm ? 0.36 : 0.21) + args.evening * 0.17 - lock * 0.15,
    0.1,
    0.52,
  )
}

export function applyMaterialWarmth(glassWarmth: number) {
  document.documentElement.style.setProperty('--glass-warmth', clamp(glassWarmth, 0, 1).toFixed(3))
}
