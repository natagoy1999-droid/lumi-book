function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Spacing pressure — gently pulls vertical air inward under cognitive strain while preserving luxury spacing floor.
 */
export function deriveSpacingPressure(cognitiveLoad: number, mentalQuietness: number): number {
  return clamp(cognitiveLoad * 0.62 + mentalQuietness * 0.3, 0, 1)
}

export function applySpaceControl(cognitiveLoad: number, mentalQuietness: number) {
  const p = deriveSpacingPressure(cognitiveLoad, mentalQuietness)
  document.documentElement.style.setProperty('--spacing-pressure', p.toFixed(3))
}

import { COGNITIVE_SECTION_GAP_EXPR } from './screenRhythm'

/** @deprecated Prefer `var(--cognitive-section-gap)` — kept for legacy imports. */
export const COGNITIVE_VERTICAL_GAP_EXPR = COGNITIVE_SECTION_GAP_EXPR
