export function microInertiaFromVars() {
  const v = getComputedStyle(document.documentElement)
  const raw = v.getPropertyValue('--micro-inertia').trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 0.12
}

export function settleFrictionFromVars() {
  const v = getComputedStyle(document.documentElement)
  const raw = v.getPropertyValue('--settle-friction').trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 0.86
}

