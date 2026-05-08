function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/**
 * Matte depth mask for secondary glass: center stays cleaner, perimeter subtly more diffuse.
 * No bitmap noise — pure gradient masks only.
 */
export function buildSecondaryMatteMask(args: {
  matteDepth: number
  materialFalloff: number
  depthDiffusion: number
}): string {
  const m = clamp(args.matteDepth, 0, 1)
  const f = clamp(args.materialFalloff, 0, 1)
  const d = clamp(args.depthDiffusion, 0, 1)

  const widen = 118 + m * 14 + f * 8
  const tall = 108 + m * 10 + d * 6
  const cy = 43 - d * 4

  const innerAlpha = clamp(0.94 - m * 0.12 - f * 0.06, 0.78, 0.94)
  const midStop = clamp(52 + m * 10 + f * 8, 48, 72)
  const rimAlpha = clamp(0.62 - m * 0.18 - d * 0.14, 0.28, 0.62)
  const outerStop = clamp(82 + d * 10 + f * 6, 74, 94)

  return `radial-gradient(${widen}% ${tall}% at 50% ${cy}%, rgba(0,0,0,1) 0%, rgba(0,0,0,${innerAlpha.toFixed(3)}) ${midStop}%, rgba(0,0,0,${rimAlpha.toFixed(3)}) ${outerStop}%, rgba(0,0,0,0) 100%)`
}
