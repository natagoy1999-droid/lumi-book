/**
 * Ultra-subtle “lit by environment” washes — no glow, no visible FX.
 */
export function cinematicAmbientWash(): string {
  return [
    'radial-gradient(118% 72% at 50% -8%, rgba(255,255,255,calc(0.055 * var(--ambient-light, 1))), transparent 55%)',
    'radial-gradient(92% 48% at 82% 18%, rgba(var(--material-temperature, 214 198 140), calc(0.045 * var(--glass-warmth, 0.28))), transparent 52%)',
  ].join(', ')
}

export function cinematicWashOpacity(): string {
  return `calc((var(--light-diffusion, 0.5) * 0.42 + var(--environment-softness, 0.45) * 0.18) * (0.94 + var(--circadian-softness, 1) * 0.06) * (1 - var(--global-quietness, 0) * 0.16) * (1 - var(--anticipation-quietness, 0) * 0.12) * (1 - var(--emotional-quietness, 0) * 0.14))`
}

/** Top highlight strength derived from illumination + calm ambience */
export function cinematicHighlightOpacity(): string {
  return `calc(0.72 * (1 - var(--global-glass-quiet, 0)) * var(--surface-illumination, 1) * (0.88 + var(--ambient-light, 1) * 0.12))`
}
