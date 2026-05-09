import type { RouteTransition } from '../state/behavioralIntel'

import {
  ROUTE_APP_CALENDAR,
  ROUTE_APP_CALENDAR_NEW,
  ROUTE_APP_CLIENTS,
  ROUTE_APP_MONEY,
  ROUTE_APP_RESCHEDULE,
  ROUTE_APP_TODAY,
} from './appRoutes'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

const PRODUCTIVE_EDGES: Array<[string, string]> = [
  [ROUTE_APP_TODAY, ROUTE_APP_CALENDAR],
  [ROUTE_APP_TODAY, ROUTE_APP_CLIENTS],
  [ROUTE_APP_TODAY, ROUTE_APP_MONEY],
  [ROUTE_APP_CALENDAR, ROUTE_APP_CALENDAR_NEW],
  [ROUTE_APP_CALENDAR, ROUTE_APP_RESCHEDULE],
  [ROUTE_APP_CALENDAR, ROUTE_APP_TODAY],
  [ROUTE_APP_CLIENTS, ROUTE_APP_TODAY],
  [ROUTE_APP_CLIENTS, ROUTE_APP_CALENDAR],
  [ROUTE_APP_RESCHEDULE, ROUTE_APP_TODAY],
  [ROUTE_APP_RESCHEDULE, ROUTE_APP_CLIENTS],
  [ROUTE_APP_MONEY, ROUTE_APP_TODAY],
  [ROUTE_APP_CALENDAR_NEW, ROUTE_APP_CALENDAR],
  [ROUTE_APP_CALENDAR_NEW, ROUTE_APP_TODAY],
  ['/today', '/calendar'],
  ['/today', '/clients'],
  ['/today', '/money'],
  ['/calendar', '/calendar/new'],
  ['/calendar', '/reschedule'],
  ['/calendar', '/today'],
  ['/clients', '/today'],
  ['/clients', '/calendar'],
  ['/reschedule', '/today'],
  ['/reschedule', '/clients'],
  ['/money', '/today'],
  ['/calendar/new', '/calendar'],
  ['/calendar/new', '/today'],
]

export type FlowMomentumInput = {
  transitions: readonly RouteTransition[]
  navBurst: number
  scrollEwma: number
  stressPressure: number
  cognitiveLoad: number
  reschedulePending: number
  pendingConfirm: number
}

function edgeCoherence(transitions: readonly RouteTransition[]): number {
  const slice = transitions.slice(-14)
  if (slice.length < 2) return 0.28
  let hits = 0
  for (const t of slice) {
    if (PRODUCTIVE_EDGES.some(([a, b]) => a === t.from && b === t.to)) hits += 1
  }
  return clamp(hits / slice.length, 0, 1)
}

/** Time gaps between navigations — calm rhythm vs frantic hopping. */
function interactionRhythm(transitions: readonly RouteTransition[]): number {
  const slice = transitions.slice(-10)
  if (slice.length < 2) return 0.35
  const gaps: number[] = []
  for (let i = 1; i < slice.length; i++) {
    gaps.push(slice[i].ts - slice[i - 1].ts)
  }
  const avg = gaps.reduce((s, x) => s + x, 0) / gaps.length
  // sweet spot ~25s–3.5min — neither idle nor frantic
  if (avg < 9000) return 0.22
  if (avg > 420_000) return 0.35
  if (avg >= 25_000 && avg <= 210_000) return 0.92
  return 0.55
}

/** Too many rapid returns to Today suggest thrashing, not flow. */
function returnThrash(transitions: readonly RouteTransition[]): number {
  const slice = transitions.slice(-14)
  const toToday = slice.filter((t) => t.to === ROUTE_APP_TODAY || t.to === '/today').length
  return clamp((toToday - 4) * 0.06, 0, 0.22)
}

/** Open loops — mild lift when user is clearly finishing work items (not gamified). */
function chainContinuity(reschedulePending: number, pendingConfirm: number): number {
  const n = reschedulePending + pendingConfirm
  return clamp(n / 6, 0, 1) * 0.08
}

/**
 * Flow momentum — calm professional continuity (not speed metrics).
 */
export function computeFlowMomentum(input: FlowMomentumInput): number {
  const {
    transitions,
    navBurst,
    scrollEwma,
    stressPressure,
    cognitiveLoad,
    reschedulePending,
    pendingConfirm,
  } = input

  let f = 0.38
  f += clamp(1 - navBurst / 8, 0, 1) * 0.18
  f += clamp(1 - (scrollEwma - 80) / 2600, 0, 1) * 0.12
  f += edgeCoherence(transitions) * 0.22
  f += interactionRhythm(transitions) * 0.14
  f += chainContinuity(reschedulePending, pendingConfirm)
  f -= stressPressure * 0.26
  f -= cognitiveLoad * 0.12
  f -= returnThrash(transitions)

  return clamp(f, 0, 1)
}
