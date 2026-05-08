function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type DepthPriority = {
  dominantZ: number
  secondaryZ: number
  secondaryGlassFade: number
}

export function computeDepthPriority(args: { depthPriority: number }): DepthPriority {
  const d = clamp(args.depthPriority, 0, 1)
  return {
    dominantZ: 1 + d * 0.8,
    secondaryZ: 1,
    secondaryGlassFade: clamp(d * 0.35, 0, 0.35),
  }
}

