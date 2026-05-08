import type { RouteTransition } from '../state/behavioralIntel'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type RoutePrediction = {
  suggestedNextPath: string | null
  routeConfidence: number
}

/**
 * Markov-lite from recent transitions — calm OS continuity only.
 */
export function predictNextRoute(transitions: readonly RouteTransition[], currentPath: string): RoutePrediction {
  const outs = transitions.filter((t) => t.from === currentPath && t.to.length > 1)
  if (outs.length < 5) {
    return { suggestedNextPath: null, routeConfidence: 0 }
  }

  const counts = new Map<string, number>()
  for (const o of outs) {
    counts.set(o.to, (counts.get(o.to) ?? 0) + 1)
  }

  let bestPath: string | null = null
  let best = 0
  for (const [p, c] of counts) {
    if (c > best) {
      best = c
      bestPath = p
    }
  }

  const confidence = bestPath ? clamp(best / outs.length, 0, 1) : 0
  return { suggestedNextPath: bestPath, routeConfidence: confidence }
}
