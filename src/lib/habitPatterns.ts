import type { Booking } from '../state/store'
import type { RouteTransition } from '../state/behavioralIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/** Share of transitions landing on paths matching prefix at same local hour (0–23). */
export function hourPathAffinity(transitions: readonly RouteTransition[], hour: number, pathPrefix: string): number {
  const atHour = transitions.filter((x) => new Date(x.ts).getHours() === hour)
  if (atHour.length < 2) return 0
  const hits = atHour.filter((x) => x.to.startsWith(pathPrefix)).length
  return clamp(hits / atHour.length, 0, 1)
}

/** После `/app/*` маршрутов учитываем и старые префиксы из истории переходов. */
export function hourPathAffinityLegacyOrApp(
  transitions: readonly RouteTransition[],
  hour: number,
  appPrefix: string,
  legacyPrefix: string,
): number {
  return Math.max(
    hourPathAffinity(transitions, hour, appPrefix),
    hourPathAffinity(transitions, hour, legacyPrefix),
  )
}

/** Typical quiet follow-up windows from sent timestamps → affinity for current hour. */
export function composerHourAffinity(composerOpens: number[], hour: number): number {
  if (composerOpens.length < 4) return 0
  const byHour = new Map<number, number>()
  for (const ts of composerOpens) {
    const h = new Date(ts).getHours()
    byHour.set(h, (byHour.get(h) ?? 0) + 1)
  }
  const peak = Math.max(...byHour.values(), 1)
  const here = byHour.get(hour) ?? 0
  return clamp(here / peak, 0, 1)
}

/** Reschedule / churn proxy from live bookings (not predictive text — scoring only). */
export function rescheduleScenarioPressure(bookings: Booking[]): number {
  if (!bookings.length) return 0
  const rs = bookings.filter((b) => b.status === 'reschedule_pending').length
  const rp = bookings.filter((b) => b.status === 'pending_confirm').length
  return clamp((rs * 0.12 + rp * 0.06) / Math.min(bookings.length, 24), 0, 1)
}

/** Data depth + consistency proxy for habit confidence floor. */
export function observationStrength(transitions: readonly RouteTransition[]): number {
  return clamp(transitions.length / 72, 0, 1)
}
