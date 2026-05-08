function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export type FocusSimplificationInput = {
  cognitiveLoad: number
  mentalQuietness: number
  focusSimplicity: number
  /** Silent density 0..1 — tightens spacing micro-step only (luxury floor preserved). */
  quietDensity?: number
}

/**
 * Calm focus simplification — quieter motion, cleaner chrome, slightly denser rhythm when overloaded.
 */
export function applyFocusSimplification(input: FocusSimplificationInput) {
  const root = document.documentElement
  const load = clamp(input.cognitiveLoad, 0, 1)
  const fq = clamp(input.focusSimplicity, 0, 1)
  const mq = clamp(input.mentalQuietness, 0, 1)
  const qd = clamp(input.quietDensity ?? readVar('--quiet-density', 0.35), 0, 1)

  const spacingMul = clamp(
    1.06 - load * 0.14 + (1 - fq) * -0.02 - qd * 0.022,
    0.88,
    1.08,
  )
  root.style.setProperty('--cognitive-spacing-mul', spacingMul.toFixed(3))

  let motionQ = readVar('--motion-quietness', 0)
  motionQ = clamp(motionQ + load * 0.09 + fq * 0.055 + mq * 0.06, 0, 1)
  root.style.setProperty('--motion-quietness', motionQ.toFixed(3))

  let stagger = readVar('--stagger-reduction', 0)
  stagger = clamp(stagger + fq * 0.08 + load * 0.06, 0, 1)
  root.style.setProperty('--stagger-reduction', stagger.toFixed(3))

  let glow = readVar('--dock-glow-opacity', 0.45)
  glow = clamp(glow * (1 - fq * 0.22 - load * 0.12), 0.08, 0.58)
  root.style.setProperty('--dock-glow-opacity', glow.toFixed(3))

  let frost = readVar('--frost-ambient-mul', 1)
  frost = clamp(frost * (1 - fq * 0.08 + load * -0.05), 0.82, 1.12)
  root.style.setProperty('--frost-ambient-mul', frost.toFixed(3))

  let edge = readVar('--light-edge-clarity', 1)
  edge = clamp(edge * (1 + fq * 0.035 + load * 0.025), 0.92, 1.15)
  root.style.setProperty('--light-edge-clarity', edge.toFixed(3))
}
