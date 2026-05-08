function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type StressPressureInput = {
  bookingsTodayActive: number
  pendingCount: number
  reschedulePendingCount: number
  cancellationsToday: number
  navBurst: number
  scrollEwma: number
  cognitiveLoad: number
  trustSuppression: number
  activeRecoveryChains: number
}

/**
 * Emotional / operational pressure — humane stress proxy (not clinical).
 */
export function computeStressPressure(input: StressPressureInput): number {
  const {
    bookingsTodayActive,
    pendingCount,
    reschedulePendingCount,
    cancellationsToday,
    navBurst,
    scrollEwma,
    cognitiveLoad,
    trustSuppression,
    activeRecoveryChains,
  } = input

  let p = 0
  p += clamp(bookingsTodayActive / 12, 0, 1) * 0.17
  p += clamp(pendingCount / 6, 0, 1) * 0.15
  p += clamp(reschedulePendingCount / 5, 0, 1) * 0.11
  p += clamp(cancellationsToday / 4, 0, 1) * 0.09
  p += clamp(navBurst / 7.5, 0, 1) * 0.11
  p += clamp((scrollEwma - 95) / 2100, 0, 1) * 0.09
  p += clamp(cognitiveLoad, 0, 1) * 0.13
  p += clamp(trustSuppression, 0, 1) * 0.07
  p += clamp(activeRecoveryChains / 4, 0, 1) * 0.08

  return clamp(p, 0, 1)
}
