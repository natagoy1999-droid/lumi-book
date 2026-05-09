export type MaterialTier = 'focus' | 'interactive' | 'ambient'

export function glassBackdropFilter(_tier: MaterialTier): string {
  // Final product polish: keep glass extremely subtle.
  // We still return a valid CSS value, but reduce blur to near-zero to avoid "blurry floating panels".
  return 'blur(0.5px)'
}

/** Unified frosted fill — alpha channel only (matches rgb white fog stack). */
export function glassFill(tier: MaterialTier): string {
  // Warm ivory surface — ties to global --lumi-surface / --lumi-bg.
  if (tier === 'focus') return 'var(--lumi-surface)'
  if (tier === 'ambient') return 'var(--lumi-bg)'
  return 'color-mix(in srgb, var(--lumi-surface) 96%, white)'
}

export function glassBorderStyle(tier: MaterialTier): string {
  const mulVar =
    tier === 'focus'
      ? '--glass-border-focus-mul'
      : tier === 'interactive'
        ? '--glass-border-interactive-mul'
        : '--glass-border-ambient-mul'
  return `rgba(255, 255, 255, calc(var(--glass-border-opacity, 0.40) * var(${mulVar}, 1) * var(--light-edge-clarity, 1) * (0.985 + var(--temporal-focus, 1) * 0.015) * (1 - var(--ambient-quietness, 0) * 0.065) * (1 - var(--spatial-quietness, 0) * 0.05)))`
}
