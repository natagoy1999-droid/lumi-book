import type { RouteTransition } from '../state/behavioralIntel'
import type { ContextScenario } from '../state/sessionContinuity'

import type { OperationalIntent, WorkflowIntentModel, WorkflowIntentScores } from './workflowIntent'

import {
  ROUTE_APP_CALENDAR_NEW,
  ROUTE_APP_CLIENTS,
  ROUTE_APP_RESCHEDULE,
  isMasterCalendarPath,
  isMasterClientsPath,
  isMasterReschedulePath,
  isMasterTodayPath,
} from './appRoutes'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function routeDensityPrefixes(
  transitions: readonly RouteTransition[],
  prefixes: readonly string[],
  windowMs: number,
): number {
  const now = Date.now()
  return transitions.filter(
    (t) => now - t.ts <= windowMs && prefixes.some((p) => t.to.startsWith(p)),
  ).length
}

/** Route repetition → stable scenario without forcing navigation */
export function computeRouteStability(transitions: readonly RouteTransition[], pathname: string): number {
  const recent = transitions.slice(-10)
  if (!recent.length) return 0.32
  const targets = recent.map((t) => t.to)
  const counts = new Map<string, number>()
  for (const p of targets) counts.set(p, (counts.get(p) ?? 0) + 1)
  let mode = ''
  let mx = 0
  for (const [k, v] of counts) {
    if (v > mx) {
      mx = v
      mode = k
    }
  }
  const cluster = mx / targets.length
  const pathAlign = pathname === mode ? 0.28 : pathname.startsWith(mode.split('/').slice(0, 2).join('/')) ? 0.14 : 0
  return clamp(cluster * 0.72 + pathAlign + 0.06, 0.18, 0.96)
}

export type WorkflowIntentInput = {
  pathname: string
  transitions: readonly RouteTransition[]
  pendingConfirm: number
  reschedulePending: number
  remindersCount: number
  tomorrowBookingCount: number
  sessionScenario: ContextScenario | null
  composerOpens: readonly number[]
  composerOpen: boolean
  navBurst: number
}

function emptyScores(): WorkflowIntentScores {
  return {
    reschedule_ops: 0,
    pending_confirm_close: 0,
    schedule_tomorrow: 0,
    clients_deep: 0,
    followup_compose: 0,
    slot_seek: 0,
    neutral: 0.08,
  }
}

function pickPrimary(scores: WorkflowIntentScores): OperationalIntent {
  let best: OperationalIntent = 'neutral'
  let v = -1
  ;(Object.keys(scores) as OperationalIntent[]).forEach((k) => {
    if (scores[k] > v) {
      v = scores[k]
      best = k
    }
  })
  return best
}

function runnerUp(scores: WorkflowIntentScores, primary: OperationalIntent): number {
  let second = 0
  ;(Object.keys(scores) as OperationalIntent[]).forEach((k) => {
    if (k === primary) return
    second = Math.max(second, scores[k])
  })
  return second
}

/**
 * Passive scoring from routes + backlog — no mind-reading framing.
 */
export function deriveWorkflowIntent(input: WorkflowIntentInput): WorkflowIntentModel {
  const s = emptyScores()
  const recentComposer = input.composerOpens.filter((t) => Date.now() - t < 55_000).length

  s.reschedule_ops +=
    clamp(input.reschedulePending / 5.5, 0, 1) * 0.46 +
    (isMasterReschedulePath(input.pathname) ? 0.34 : 0) +
    clamp(
      routeDensityPrefixes(input.transitions, [ROUTE_APP_RESCHEDULE, '/reschedule'], 52 * 60_000) / 5,
      0,
      1,
    ) * 0.28

  s.pending_confirm_close +=
    clamp(input.pendingConfirm / 5.5, 0, 1) * 0.42 +
    (isMasterTodayPath(input.pathname) && input.pendingConfirm > 0 ? 0.18 : 0) +
    clamp(input.remindersCount / 12, 0, 1) * 0.14

  const h = new Date().getHours()
  s.schedule_tomorrow +=
    (isMasterCalendarPath(input.pathname) ? 0.26 : 0) +
    clamp(input.tomorrowBookingCount / 9, 0, 1) * 0.22 +
    (h >= 16 && h <= 22 && isMasterCalendarPath(input.pathname) ? 0.12 : 0)

  const clientsHits = routeDensityPrefixes(
    input.transitions,
    [ROUTE_APP_CLIENTS, '/clients'],
    3 * 60 * 60_000,
  )
  s.clients_deep +=
    (isMasterClientsPath(input.pathname) ? 0.44 : 0) +
    clamp(clientsHits / 5, 0, 1) * 0.32

  s.followup_compose +=
    (input.composerOpen ? 0.52 : 0) +
    clamp(recentComposer / 7, 0, 1) * 0.34 +
    (input.sessionScenario === 'composer_followup' ? 0.18 : 0)

  s.slot_seek +=
    (input.pathname.includes('/calendar/new') ? 0.46 : 0) +
    (isMasterCalendarPath(input.pathname) ? 0.14 : 0) +
    clamp(
      routeDensityPrefixes(input.transitions, [ROUTE_APP_CALENDAR_NEW, '/calendar/new'], 70 * 60_000) / 4,
      0,
      1,
    ) * 0.26

  s.neutral += clamp(input.navBurst / 8.5, 0, 1) * 0.38

  const primary = pickPrimary(s)
  const top = s[primary]
  const second = runnerUp(s, primary)
  const confidence = clamp((top - second) / (top + 0.09), 0, 1) * clamp(top, 0, 1)

  const sum = (Object.values(s) as number[]).reduce((a, b) => a + b, 0) + 0.001
  const activeIntentStrength = clamp(top / sum, 0, 1)

  const stability = computeRouteStability(input.transitions, input.pathname)

  return {
    primary,
    scores: s,
    confidence,
    stability,
    activeIntentStrength,
  }
}
