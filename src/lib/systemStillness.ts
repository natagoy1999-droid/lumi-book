function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 0
}

/**
 * System-wide stillness: entire chrome quiets under critical focus (not dock-only).
 */
export function applySystemStillness() {
  const root = document.documentElement
  const lock = readVar('--attention-lock')
  const freeze = readVar('--motion-freeze')
  const still = readVar('--stillness-level')
  const quiet = readVar('--motion-quietness')

  const system = clamp(lock * 0.52 + freeze * 0.38 + still * 0.34 + quiet * 0.22, 0, 1)
  root.style.setProperty('--system-stillness', system.toFixed(3))

  const glassQuiet = clamp(0.06 + system * 0.2, 0.06, 0.28)
  root.style.setProperty('--global-glass-quiet', glassQuiet.toFixed(3))

  const sheetDim = clamp(1 - system * 0.08, 0.9, 1)
  root.style.setProperty('--chrome-opacity-quiet', sheetDim.toFixed(3))

  const motionUi = clamp(1 - system * 0.22, 0.72, 1)
  root.style.setProperty('--ui-motion-scale', motionUi.toFixed(3))
}
