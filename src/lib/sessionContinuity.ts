import { useSessionContinuity } from '../state/sessionContinuity'

/** Restore tab-scoped session continuity from `sessionStorage` (call once on app mount). */
export function hydrateSessionContinuity() {
  useSessionContinuity.getState().hydrateFromStorage()
}

/** Track primary route for scenario + resume hints (call on pathname change). */
export function syncSessionRoute(pathname: string) {
  useSessionContinuity.getState().recordSessionPath(pathname)
}

/** Background / foreground — gentle resume pulse after meaningful absence. */
export function attachVisibilityContinuity() {
  const handler = () => {
    useSessionContinuity.getState().markVisibility(document.visibilityState === 'visible')
  }
  document.addEventListener('visibilitychange', handler)
  return () => document.removeEventListener('visibilitychange', handler)
}
