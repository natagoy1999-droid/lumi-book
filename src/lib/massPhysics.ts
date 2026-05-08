export type MassVars = {
  motionMass: number
  settleDurationMs: number
  dockPressure: number
  layoutInertia: number
  staggerDelayMs: number
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function massVars(args: {
  pressure: number // 0..1
  mode: 'calm' | 'busy'
  density: 'comfortable' | 'compact' | 'ultraCompact'
}): MassVars {
  const { pressure, mode, density } = args
  const p = clamp(pressure, 0, 1)

  // Calm: heavier, slower settle. Busy: tighter, quicker settle.
  const calmBoost = mode === 'calm' ? 0.12 : -0.04

  const motionMass = clamp(lerp(0.92, 0.78, p) + calmBoost, 0.72, 1.02)
  const settleDurationMs = Math.round(lerp(380, 260, p) + (mode === 'calm' ? 40 : 0))
  const layoutInertia = clamp(lerp(1.0, 0.86, p), 0.82, 1.0)

  // Stagger: subtle, premium. UltraCompact = slightly more “snap”, less delay.
  const baseDelay =
    density === 'ultraCompact' ? 22 : density === 'compact' ? 34 : 44
  const staggerDelayMs = Math.round(baseDelay - p * 10)

  return {
    motionMass,
    settleDurationMs,
    dockPressure: p,
    layoutInertia,
    staggerDelayMs,
  }
}

export function applyMassVars(v: MassVars) {
  const root = document.documentElement
  root.style.setProperty('--motion-mass', `${v.motionMass.toFixed(3)}`)
  root.style.setProperty('--settle-duration', `${v.settleDurationMs}ms`)
  root.style.setProperty('--dock-pressure', `${v.dockPressure.toFixed(3)}`)
  root.style.setProperty('--layout-inertia', `${v.layoutInertia.toFixed(3)}`)
  root.style.setProperty('--stagger-delay', `${v.staggerDelayMs}ms`)
}

