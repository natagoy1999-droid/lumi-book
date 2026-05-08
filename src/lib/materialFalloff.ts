function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/** Soft material clarity falloff: secondary reads deeper / more diffuse at perimeter. */
export type MaterialFalloff = {
  /** 0..1 — overall clarity decay toward edges (secondary layer) */
  falloff: number
  /** 0..1 — paired diffuse strength for masks / blur coupling */
  diffusion: number
}

export function computeMaterialFalloff(args: {
  attentionLock: number
  materialDepth: number
  glassDistance: number
  secondaryFade: number
}): MaterialFalloff {
  const lock = clamp(args.attentionLock, 0, 1)
  const depth = clamp(args.materialDepth, 0, 1)
  const dist = clamp(args.glassDistance, 0, 1)
  const fade = clamp(args.secondaryFade, 0, 1)

  const falloff = clamp(
    0.12 + dist * 0.34 + depth * 0.22 + fade * 0.2 + lock * 0.08,
    0.1,
    0.58,
  )
  const diffusion = clamp(falloff * 0.92 + lock * 0.05, 0.09, 0.52)

  return { falloff, diffusion }
}
