import { computeCalmUrgency } from './calmUrgency'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function applyPremiumStillness(args: {
  minutesToNext?: number
  dominantScore: number
  pressure: number
}) {
  const v = computeCalmUrgency(args)
  const root = document.documentElement

  root.style.setProperty('--stillness-level', v.stillness.toFixed(3))
  root.style.setProperty('--focus-lock', v.focusLock.toFixed(3))
  root.style.setProperty('--motion-quietness', v.motionQuietness.toFixed(3))
  root.style.setProperty('--stagger-reduction', v.staggerReduction.toFixed(3))
  root.style.setProperty('--urgency-density', v.urgencyDensity.toFixed(3))

  // Calm urgency tweaks: make glow calmer + settle shorter (no jumps).
  // These multiply existing systems by gently biasing values.
  const glow = clamp(0.55 - v.stillness * 0.28, 0.12, 0.55)
  root.style.setProperty('--dock-glow-opacity', glow.toFixed(3))

  const settleMs = clamp(320 - v.stillness * 110, 180, 320)
  root.style.setProperty('--settle-duration', `${Math.round(settleMs)}ms`)
}

