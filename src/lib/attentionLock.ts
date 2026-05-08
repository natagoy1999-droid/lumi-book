function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type AttentionLockVars = {
  on: number // 0..1
  focusContrast: number // 0..1
  secondaryFade: number // 0..1
  depthPriority: number // 0..1
  motionFreeze: number // 0..1
}

export function computeAttentionLock(args: {
  minutesToNext?: number
  dominantScore: number
  pressure: number
}): AttentionLockVars {
  const { minutesToNext, dominantScore, pressure } = args

  const byTime =
    typeof minutesToNext === 'number'
      ? minutesToNext <= 40
        ? 1
        : minutesToNext <= 65
          ? 0.45
          : 0
      : 0

  const byScore = dominantScore >= 90 ? 1 : dominantScore >= 80 ? 0.55 : 0.15
  const on = clamp(byTime * 0.72 + byScore * 0.28, 0, 1)

  // Contrast rises slightly, not aggressive.
  const focusContrast = clamp(0.28 + on * 0.42, 0, 1)
  // Secondary fades softly.
  const secondaryFade = clamp(on * 0.22 + pressure * 0.10, 0, 0.38)
  // Depth: dominant closer.
  const depthPriority = clamp(on * 0.55, 0, 0.7)
  // Freeze motion (breathing almost off), but not fully zero.
  const motionFreeze = clamp(on * 0.85, 0, 0.9)

  return { on, focusContrast, secondaryFade, depthPriority, motionFreeze }
}

export function applyAttentionLock(v: AttentionLockVars) {
  const root = document.documentElement
  root.style.setProperty('--attention-lock', v.on.toFixed(3))
  root.style.setProperty('--focus-contrast', v.focusContrast.toFixed(3))
  root.style.setProperty('--secondary-fade', v.secondaryFade.toFixed(3))
  root.style.setProperty('--depth-priority', v.depthPriority.toFixed(3))
  root.style.setProperty('--motion-freeze', v.motionFreeze.toFixed(3))
}

