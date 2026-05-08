export type MaterialTier = 'focus' | 'interactive' | 'ambient'

function illuminationMulVar(tier: MaterialTier): string {
  return tier === 'focus'
    ? '--illumination-focus-mul'
    : tier === 'interactive'
      ? '--illumination-secondary-mul'
      : '--illumination-ambient-mul'
}

export function glassBackdropFilter(tier: MaterialTier): string {
  const scaleVar =
    tier === 'focus'
      ? '--glass-blur-focus-scale'
      : tier === 'interactive'
        ? '--glass-blur-interactive-scale'
        : '--glass-blur-ambient-scale'
  const sq = tier === 'ambient' ? 0.018 : tier === 'interactive' ? 0.012 : 0.008
  return `blur(calc(var(--glass-blur, 18px) * var(${scaleVar}, 1) * (0.988 + var(--circadian-softness, 1) * 0.012) * (1 - var(--ambient-quietness, 0) * ${tier === 'ambient' ? 0.085 : tier === 'interactive' ? 0.048 : 0.028}) * (1 + var(--spatial-quietness, 0) * ${sq})))`
}

/** Unified frosted fill — alpha channel only (matches rgb white fog stack). */
export function glassFill(tier: MaterialTier): string {
  const alphaVar =
    tier === 'focus'
      ? '--surface-primary'
      : tier === 'interactive'
        ? '--surface-secondary'
        : '--surface-ambient'
  const illum = illuminationMulVar(tier)
  const warmth = `color-mix(in srgb, rgb(var(--material-temperature, 214 198 140)) calc(var(--glass-warmth, 0.28) * var(--time-warmth, 1) * ${tier === 'focus' ? '12%' : tier === 'interactive' ? '16%' : '20%'}), transparent)`

  return `color-mix(in srgb, rgba(255, 255, 255, calc(var(${alphaVar}, 0.58) * var(${illum}, 1) * var(--day-clarity, 1))), ${warmth})`
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
