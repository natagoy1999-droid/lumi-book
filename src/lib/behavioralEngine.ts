import type { BehavioralSnapshot, RouteTransition } from '../state/behavioralIntel'
import type { Booking } from '../state/store'

import {
  ROUTE_APP_CALENDAR,
  ROUTE_APP_CLIENTS,
  ROUTE_APP_RESCHEDULE,
  isMasterClientsPath,
  isMasterTodayPath,
} from './appRoutes'
import type { DockAction } from './actionEngine'
import {
  composerHourAffinity,
  hourPathAffinityLegacyOrApp,
  observationStrength,
  rescheduleScenarioPressure,
} from './habitPatterns'
import { predictNextRoute } from './predictiveRouting'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Behavioral intelligence — offline habit fusion for scoring + calm anticipation tokens.
 */
export function computeBehavioralSnapshot(input: {
  pathname: string
  transitions: RouteTransition[]
  composerOpens: number[]
  bookings: Booking[]
  sent: Array<{ sentAt: number }>
  now?: Date
}): BehavioralSnapshot {
  const now = input.now ?? new Date()
  const hour = now.getHours()
  const { transitions, pathname, bookings, composerOpens } = input

  const { suggestedNextPath, routeConfidence } = predictNextRoute(transitions, pathname)

  const affCal = hourPathAffinityLegacyOrApp(transitions, hour, ROUTE_APP_CALENDAR, '/calendar')
  const affRs = hourPathAffinityLegacyOrApp(transitions, hour, ROUTE_APP_RESCHEDULE, '/reschedule')
  const affClients = hourPathAffinityLegacyOrApp(transitions, hour, ROUTE_APP_CLIENTS, '/clients')
  const composerAff = composerHourAffinity(composerOpens, hour)

  const depth = observationStrength(transitions)
  const churn = rescheduleScenarioPressure(bookings)

  const habitConfidence = clamp(
    depth * 0.52 +
      Math.max(affCal, affRs, affClients, composerAff) * 0.38 +
      churn * 0.1,
    0,
    1,
  )

  const routeAffinity = suggestedNextPath?.startsWith(ROUTE_APP_CALENDAR) ||
    suggestedNextPath?.startsWith('/calendar')
    ? affCal
    : suggestedNextPath?.startsWith(ROUTE_APP_RESCHEDULE) || suggestedNextPath?.startsWith('/reschedule')
      ? affRs
      : 0
  let predictiveFocus = clamp(routeConfidence * (0.55 + routeAffinity * 0.45), 0, 1)

  if (composerAff > 0.45 && (isMasterTodayPath(pathname) || isMasterClientsPath(pathname))) {
    predictiveFocus = clamp(predictiveFocus + composerAff * 0.08, 0, 1)
  }

  let sentAff = 0
  if (input.sent.length >= 6) {
    const tail = input.sent.slice(-48)
    const sameHour = tail.filter((s) => new Date(s.sentAt).getHours() === hour).length
    sentAff = clamp(sameHour / Math.max(14, tail.length), 0, 1)
  }

  const habitConfidenceAdjusted = clamp(habitConfidence + sentAff * 0.07, 0, 1)

  const anticipationLevel = clamp(
    habitConfidenceAdjusted * 0.44 + routeConfidence * 0.36 + predictiveFocus * 0.2,
    0,
    1,
  )

  const behavioralReadiness = clamp(habitConfidenceAdjusted * 0.5 + predictiveFocus * 0.5, 0, 1)

  return {
    habitConfidence: habitConfidenceAdjusted,
    predictiveFocus,
    behavioralReadiness,
    anticipationLevel,
    routeConfidence,
    suggestedNextPath,
  }
}

/** Habit-aware dock scoring — max ~5% lift × trust multiplier; never reshuffles urgency semantics. */
export function applyHabitAwareDockBoost(
  actions: DockAction[],
  snap: BehavioralSnapshot,
  trustDockMultiplier = 1,
): DockAction[] {
  if (!actions.length) return actions

  return actions
    .map((a) => {
      let m = trustDockMultiplier
      if (a.kind.kind === 'open_reschedule') {
        m *= 1 + snap.habitConfidence * 0.048
      }
      if (
        a.kind.kind === 'offer_slot' &&
        (snap.suggestedNextPath?.startsWith(ROUTE_APP_CALENDAR) ||
          snap.suggestedNextPath?.startsWith('/calendar'))
      ) {
        m *= 1 + snap.routeConfidence * 0.038
      }
      if (a.kind.kind === 'nudge_pending' || a.kind.kind === 'write_client') {
        m *= 1 + snap.predictiveFocus * 0.032
      }
      return { ...a, score: Math.min(108, Math.round(a.score * m * 10) / 10) }
    })
    .sort((x, y) => y.score - x.score)
}
