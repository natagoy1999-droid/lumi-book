let iv: number | null = null
let phase = 0

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function getVar(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export function startGlassBreathing() {
  if (iv) return
  iv = window.setInterval(() => {
    const still = getVar('--urgency-stillness', 0)
    const quiet = getVar('--motion-quietness', 0)
    const decay = getVar('--motion-decay', 1)
    const lock = getVar('--attention-lock', 0)
    const matte = getVar('--matte-depth', 0)

    // calm -> slightly more alive, urgent -> almost still; lock -> cleaner breath (never zero)
    const rhythm = getVar('--ambient-rhythm', 1)
    const mentalQuiet = getVar('--mental-quietness', 0)
    const ambientQuiet = getVar('--ambient-quietness', 0)
    const materialStill = getVar('--material-stillness', 0)
    const livingGlass = getVar('--living-glass', 0.72)
    const depthBreath = clamp(1 - lock * 0.18 - matte * 0.045, 0.82, 1)
    const cognitiveQuiet = clamp(1 - mentalQuiet * 0.34, 0.62, 1)
    const amp = clamp(
      0.010 *
        (1 - still) *
        (1 - quiet * 0.8) *
        decay *
        depthBreath *
        rhythm *
        cognitiveQuiet *
        (1 - ambientQuiet * 0.92) *
        (1 - materialStill * 0.38) *
        (0.52 + livingGlass * 0.48),
      0.001,
      0.010,
    )
    phase += 0.16
    const w = 1 + Math.sin(phase) * amp

    document.documentElement.style.setProperty('--glass-breathing', w.toFixed(4))
  }, 900)
}

export function stopGlassBreathing() {
  if (iv) {
    window.clearInterval(iv)
    iv = null
  }
}

