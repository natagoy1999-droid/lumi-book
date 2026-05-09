import type { HomeMode } from './homeEngine'

import {
  isMasterCalendarPath,
  isMasterMoneyPath,
  isMasterReschedulePath,
  isMasterTodayPath,
} from './appRoutes'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type MaterialHierarchy = {
  /** Level 1 — dominant focus: clearer, closer */
  focusBlurScale: number
  focusSoftness: number
  focusDepthScale: number
  /** Level 2 — interactive glass */
  interactiveBlurScale: number
  interactiveSoftness: number
  interactiveDepthScale: number
  /** Level 3 — ambient / chrome */
  ambientBlurScale: number
  ambientSoftness: number
  ambientDepthScale: number
  /** Warm bias mixed into hierarchy (calm → softer warmth) */
  ambientWarmth: number
}

/**
 * Ambient material hierarchy: three coherent tiers from one digital material.
 */
export function computeMaterialHierarchy(args: {
  homeMode: HomeMode
  attentionLock: number
  motionFreeze: number
  pathname: string
}): MaterialHierarchy {
  const calm = args.homeMode === 'calm'
  const lock = clamp(args.attentionLock, 0, 1)
  const freeze = clamp(args.motionFreeze, 0, 1)

  const routeTight =
    isMasterTodayPath(args.pathname) ||
    isMasterCalendarPath(args.pathname) ||
    isMasterReschedulePath(args.pathname)
      ? 1
      : isMasterMoneyPath(args.pathname)
        ? 0.98
        : 1.02

  // calm → softer interactive glass, warmer ambience; busy → cleaner focus tier
  const focusBlurScale = clamp(
    (calm ? 0.93 : 0.89) - lock * 0.05 - freeze * 0.03,
    0.8,
    0.98,
  )

  const interactiveBlurScale = clamp(
    ((calm ? 1.06 : 0.99) + lock * 0.025) * routeTight,
    0.94,
    1.14,
  )

  const ambientBlurScale = clamp((calm ? 1.11 : 1.05) + lock * 0.02, 1.02, 1.2)

  const focusSoftness = clamp(0.28 + (calm ? 0.08 : 0.04) + lock * -0.06, 0.18, 0.38)
  const interactiveSoftness = clamp(0.42 + (calm ? 0.12 : 0.06) + lock * 0.04, 0.35, 0.62)
  const ambientSoftness = clamp(0.52 + (calm ? 0.1 : 0.06), 0.45, 0.72)

  const focusDepthScale = clamp(1 + lock * 0.14 + (calm ? -0.02 : 0.04), 0.94, 1.22)
  const interactiveDepthScale = clamp(0.62 + (calm ? 0.06 : 0.02) - lock * 0.05, 0.52, 0.78)
  const ambientDepthScale = clamp(0.38 + (calm ? 0.08 : 0.04), 0.32, 0.55)

  const ambientWarmth = clamp((calm ? 0.42 : 0.22) + lock * -0.08, 0.12, 0.48)

  return {
    focusBlurScale,
    interactiveBlurScale,
    ambientBlurScale,
    focusSoftness,
    interactiveSoftness,
    ambientSoftness,
    focusDepthScale,
    interactiveDepthScale,
    ambientDepthScale,
    ambientWarmth,
  }
}
