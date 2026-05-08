export function msVar(name: string, fallbackMs: number) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(v.replace('ms', ''))
  return Number.isFinite(n) ? n : fallbackMs
}

export function secondaryDelaySeconds() {
  const ms = msVar('--stagger-delay', 38)
  const redRaw = getComputedStyle(document.documentElement).getPropertyValue('--stagger-reduction').trim()
  const r = Number.parseFloat(redRaw)
  const reduction = Number.isFinite(r) ? Math.max(0, Math.min(0.92, r)) : 0
  // Keep tiny mass even at max reduction (never fully zero)
  const effectiveMs = Math.max(10, ms * (1 - reduction))
  return effectiveMs / 1000
}

