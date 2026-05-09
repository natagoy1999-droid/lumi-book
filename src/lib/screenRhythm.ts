import {
  isMasterCalendarPath,
  isMasterClientsPath,
  isMasterMoneyPath,
  isMasterReschedulePath,
  isMasterTodayPath,
} from './appRoutes'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Cross-screen vertical rhythm — one shared “breath” derived from load + route family (never abrupt).
 */
export function applyScreenRhythm(pathname: string, cognitiveLoad: number) {
  const load = clamp(cognitiveLoad, 0, 1)
  let rhythm = 1 - load * 0.078
  if (isMasterCalendarPath(pathname)) rhythm -= load * 0.028
  if (isMasterMoneyPath(pathname)) rhythm -= load * 0.018
  if (isMasterClientsPath(pathname)) rhythm -= load * 0.015
  if (pathname.includes('/calendar/new') || isMasterReschedulePath(pathname)) rhythm -= load * 0.022
  if (isMasterTodayPath(pathname)) rhythm += (1 - load) * 0.012
  rhythm = clamp(rhythm, 0.855, 1)
  document.documentElement.style.setProperty('--global-rhythm', rhythm.toFixed(3))
}

/** Stacked sections (flex-col) — replaces fixed Tailwind space-y-3 where applied. */
export const COGNITIVE_INLINE_STACK_GAP =
  'calc(0.75rem * var(--global-rhythm, 1) * (1 - var(--global-cognitive-load, 0) * 0.052))'

/** Grid gap (~gap-3) with global rhythm. */
export const COGNITIVE_GRID_GAP =
  'calc(0.75rem * var(--global-rhythm, 1) * (1 - var(--global-cognitive-load, 0) * 0.048))'

/**
 * Main vertical column — stack-gap × cognitive spacing × rhythm compression × global rhythm.
 */
export const COGNITIVE_SECTION_GAP_EXPR =
  'calc(var(--stack-gap, 14px) * var(--cognitive-spacing-mul, 1) * var(--global-rhythm, 1) * (1 - var(--rhythm-compression, 0) * 0.105) * (1 - var(--spacing-pressure, 0) * 0.042) * (1 - var(--global-cognitive-load, 0) * 0.018) * (1 + var(--behavioral-readiness, 0) * 0.016))'

/**
 * Mirrors rhythm calcs onto :root so screens can use var(--cognitive-inline-stack), etc.
 */
export function applyCognitiveRhythmCssVars() {
  const root = document.documentElement
  root.style.setProperty('--cognitive-inline-stack', COGNITIVE_INLINE_STACK_GAP)
  root.style.setProperty('--cognitive-grid-gap', COGNITIVE_GRID_GAP)
  root.style.setProperty('--cognitive-section-gap', COGNITIVE_SECTION_GAP_EXPR)
}
