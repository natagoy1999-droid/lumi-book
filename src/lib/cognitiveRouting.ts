function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type RouteEnergyOpts = {
  interactionEnergy?: number
  fatigueLevel?: number
  humanePacing?: number
}

/**
 * Route transitions stay inside one calm OS — motion tightens slightly under load (no mode labels).
 * Optional energy opts subtly adapt pacing (confident rhythm vs fatigue-aware softness).
 */
export function cognitiveRouteSpring(
  load: number,
  pathname: string,
  flowMomentum = 0,
  opts?: RouteEnergyOpts,
) {
  const p = clamp(load, 0, 1)
  const fm = clamp(flowMomentum, 0, 1)
  const sheet = pathname.includes('/calendar/new') || pathname.startsWith('/reschedule') ? p * 0.07 : 0
  let stiffness = 522 - p * 78 - sheet * 24 - fm * 26
  let damping = 44 + p * 12 + sheet * 5 + fm * 9
  let mass = 0.86 + p * 0.11 + sheet * 0.04 + fm * 0.07

  if (opts) {
    const ie = clamp(opts.interactionEnergy ?? 0.5, 0, 1)
    const fat = clamp(opts.fatigueLevel ?? 0.35, 0, 1)
    const hp = clamp(opts.humanePacing ?? 0.35, 0, 1)
    const confident = ie * (1 - fat * 0.62) * (1 - hp * 0.42)
    stiffness *= 1 + confident * 0.085 - fat * 0.065 - hp * 0.055
    damping *= 1 - confident * 0.048 + fat * 0.092 + hp * 0.078
    mass *= 1 + fat * 0.065 + hp * 0.045 - confident * 0.035
  }

  return {
    type: 'spring' as const,
    stiffness: Math.round(stiffness),
    damping,
    mass: clamp(mass, 0.82, 1.18),
  }
}

export function cognitiveRoutePresenceY(load: number, flowMomentum = 0, fatigueLevel = 0.32) {
  const p = clamp(load, 0, 1)
  const fm = clamp(flowMomentum, 0, 1)
  const f = clamp(fatigueLevel, 0, 1)
  return 9 - p * 3.2 - fm * 1.4 - f * 1.35
}
