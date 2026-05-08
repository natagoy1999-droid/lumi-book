let raf: number | null = null
let start = 0

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function kickMotionDecay() {
  // On activity, briefly allow motion, then settle into stillness.
  const root = document.documentElement
  root.style.setProperty('--motion-decay', '1')
  if (raf) cancelAnimationFrame(raf)
  start = performance.now()

  const tick = (t: number) => {
    const dt = t - start
    // 0..1 over 2600ms
    const x = clamp(dt / 2600, 0, 1)
    // easeOut
    const e = 1 - Math.pow(1 - x, 2)
    // decay 1 -> 0.62
    const v = 1 - e * 0.38
    root.style.setProperty('--motion-decay', v.toFixed(3))
    if (x < 1) raf = requestAnimationFrame(tick)
    else raf = null
  }

  raf = requestAnimationFrame(tick)
}

