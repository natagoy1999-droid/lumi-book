import type { DockAction } from './actionEngine'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Interruption recovery — small priority lift for open loops (never autonomous actions).
 */
export function applyContextAwareDockBoost(
  actions: DockAction[],
  unfinishedPressure: number,
  contextMemoryScore: number,
): DockAction[] {
  if (!actions.length) return actions
  const m = 1 + clamp(unfinishedPressure, 0, 1) * 0.042 + clamp(contextMemoryScore, 0, 1) * 0.028
  return actions
    .map((a) => ({ ...a, score: Math.min(108, Math.round(a.score * m * 10) / 10) }))
    .sort((x, y) => y.score - x.score)
}
