import type { Booking } from '../state/store'
import type { ContextScenario } from '../state/sessionContinuity'
import { useContextIntel } from '../state/contextIntel'

import type { RouteTransition } from '../state/behavioralIntel'

import { isMasterCalendarPath, isMasterClientsPath, isMasterReschedulePath } from './appRoutes'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type ContextMemoryInput = {
  pathname: string
  bookings: Booking[]
  dateISO: string
  lastScenario: ContextScenario | null
  lastPrimaryPath: string
  transitions: readonly RouteTransition[]
  abandonedComposerAt: number | null
  now: number
}

export type ContextMemoryDerived = {
  activeScenario: ContextScenario
  unfinishedPressure: number
  contextMemoryScore: number
  workflowContinuity: number
  recentDecisionContext: 'heavy_day' | 'light_touch' | 'neutral'
}

function pendingToday(bookings: Booking[], dateISO: string) {
  return bookings.filter(
    (b) =>
      b.dateISO === dateISO &&
      (b.status === 'pending_confirm' || b.status === 'reschedule_pending'),
  ).length
}

function rescheduleAll(bookings: Booking[]) {
  return bookings.filter((b) => b.status === 'reschedule_pending').length
}

/**
 * Context continuity — operational memory without task-manager framing.
 */
export function deriveContextMemory(input: ContextMemoryInput): ContextMemoryDerived {
  const { pathname, bookings, dateISO, lastScenario, lastPrimaryPath, transitions, abandonedComposerAt, now } =
    input

  const pConfirm = bookings.filter(
    (b) => b.status === 'pending_confirm' && b.dateISO === dateISO,
  ).length
  const pResched = rescheduleAll(bookings)
  const pend = pendingToday(bookings, dateISO)

  let activeScenario: ContextScenario = lastScenario ?? 'idle'
  if (isMasterReschedulePath(pathname) || pResched >= 2) activeScenario = 'reschedule_queue'
  else if (pConfirm >= 2) activeScenario = 'confirm_queue'
  else if (isMasterCalendarPath(pathname)) activeScenario = 'schedule'
  else if (isMasterClientsPath(pathname)) activeScenario = 'clients'
  else if (abandonedComposerAt && now - abandonedComposerAt < 36 * 60 * 60 * 1000)
    activeScenario = 'composer_followup'

  let unfinishedPressure = clamp(pConfirm / 6, 0, 1) * 0.38 + clamp(pResched / 5, 0, 1) * 0.42
  if (abandonedComposerAt && now - abandonedComposerAt < 24 * 60 * 60 * 1000) {
    unfinishedPressure += 0.12
  }
  unfinishedPressure = clamp(unfinishedPressure, 0, 1)

  const routeStick =
    transitions.length >= 2
      ? transitions.slice(-4).filter((t) => t.to === lastPrimaryPath || t.from === lastPrimaryPath).length /
        4
      : 0.25

  const contextMemoryScore = clamp(
    routeStick * 0.35 + (lastScenario && lastScenario !== 'idle' ? 0.25 : 0) + unfinishedPressure * 0.22,
    0,
    1,
  )

  const workflowContinuity = clamp(
    contextMemoryScore * 0.55 + (1 - unfinishedPressure * 0.35) * 0.45,
    0,
    1,
  )

  let recentDecisionContext: ContextMemoryDerived['recentDecisionContext'] = 'neutral'
  if (pend >= 4 || pResched >= 3) recentDecisionContext = 'heavy_day'
  else if (pend + pResched <= 1) recentDecisionContext = 'light_touch'

  return {
    activeScenario,
    unfinishedPressure,
    contextMemoryScore,
    workflowContinuity,
    recentDecisionContext,
  }
}

function applyContextMemoryTokens(d: ContextMemoryDerived) {
  const root = document.documentElement
  root.style.setProperty('--context-memory', String(d.contextMemoryScore))
  root.style.setProperty('--workflow-continuity', String(d.workflowContinuity))
  root.style.setProperty('--unfinished-pressure', String(d.unfinishedPressure))
  const sessionCalm = clamp(d.workflowContinuity * (1 - d.unfinishedPressure * 0.45), 0, 1)
  root.style.setProperty('--session-calm', String(sessionCalm))
  const resumptionSoft = clamp(
    0.42 + d.workflowContinuity * 0.35 - d.unfinishedPressure * 0.12,
    0,
    1,
  )
  root.style.setProperty('--resumption-softness', String(resumptionSoft))
}

/**
 * Derives context memory, updates context intel store, and writes continuity CSS tokens on `:root`.
 */
export function applyContextMemoryLayer(input: ContextMemoryInput): ContextMemoryDerived {
  const derived = deriveContextMemory(input)
  useContextIntel.getState().setDerived(derived)
  applyContextMemoryTokens(derived)
  return derived
}
