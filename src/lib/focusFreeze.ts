function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type FocusFreeze = {
  breathingMul: number
  settleMul: number
  glowMul: number
}

export function computeFocusFreeze(args: { motionFreeze: number }): FocusFreeze {
  const f = clamp(args.motionFreeze, 0, 1)
  // freeze reduces breathing strongly, settle moderately, glow slightly
  const breathingMul = clamp(1 - f * 0.92, 0.06, 1)
  const settleMul = clamp(1 - f * 0.55, 0.35, 1)
  const glowMul = clamp(1 - f * 0.35, 0.55, 1)
  return { breathingMul, settleMul, glowMul }
}

