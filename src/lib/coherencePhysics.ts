function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function readVarNumber(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export function readVarPx(name: string, fallbackPx: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw.replace('px', ''))
  return Number.isFinite(n) ? n : fallbackPx
}

export function writeVarNumber(name: string, value: number) {
  document.documentElement.style.setProperty(name, value.toFixed(3))
}

export function writeVarPx(name: string, px: number) {
  document.documentElement.style.setProperty(name, `${Math.round(px)}px`)
}

export function absDelta(a: number, b: number): number {
  return Math.abs(a - b)
}

/** Frame-rate independent exponential smoothing factor. */
export function dtAlpha(dtMs: number, tauMs: number): number {
  if (!Number.isFinite(dtMs) || dtMs <= 0) return 1
  const tau = Math.max(16, tauMs)
  const a = 1 - Math.exp(-dtMs / tau)
  return clamp(a, 0.02, 1)
}

export function mix(current: number, target: number, alpha: number): number {
  return current + (target - current) * clamp(alpha, 0, 1)
}

export function clamp01(v: number) {
  return clamp(v, 0, 1)
}

