/**
 * Advisory surface delicacy — CSS-friendly multipliers for calm luxury UI.
 * Values assume --communication-calm, --advisory-delicacy, --social-quietness are set each material tick.
 */

/** Outer assistant / reminder panels */
export function advisoryShellOpacity(): string {
  return `calc((0.93 + var(--assistant-presence, 0.6) * 0.07) * (1 - var(--temporal-quietness, 0) * 0.1) * (0.88 + var(--advisory-delicacy, 0.55) * 0.12))`
}

/** Inner advisory cards (multiplies existing per-kind opacity) */
export function advisoryCardToneMul(): string {
  return `calc(1 - var(--social-quietness, 0.35) * 0.07)`
}

/** Focus dock gold wash — quieter when social noise is high */
export function dockGlowOpacityExpr(): string {
  return `calc(var(--dock-glow-opacity, 0.55) * (1 - var(--social-quietness, 0.35) * 0.42))`
}

/** Primary dock CTA shadow intensity */
export function dockCtaShadowClass(socialQuietness: number): string {
  return socialQuietness > 0.58 ? 'shadow-soft' : 'shadow-glowGold'
}

/** Compact / secondary pills in dock */
export function dockSecondaryPillOpacity(): string {
  return `calc(1 - var(--social-quietness, 0.35) * 0.22)`
}

/** Recovery dashboard metric emphasis */
export function recoverySurfaceCalm(): string {
  return `calc(0.96 - var(--social-quietness, 0.35) * 0.04)`
}

/** Multiply any opacity expression by gentle social quietness (subtle). */
export function withSocialQuietMul(innerExpr: string): string {
  return `calc((${innerExpr}) * (1 - var(--social-quietness, 0.35) * 0.07))`
}
