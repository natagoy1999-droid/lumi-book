function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

/** iOS-like dominant highlight: shorter + denser + calmer when attention locks. */
export type FocusEdgeShortening = {
  /** 0..1 — drives inset + highlight compression */
  shortening: number
  /** px added to --edge-inset on dominant highlight */
  insetExtraPx: number
  /** Multiplier for micro-highlight opacity (stable “density”) */
  highlightDensity: number
}

export function computeFocusEdgeShortening(args: {
  attentionLock: number
  focusContrast: number
  focusSharpness: number
}): FocusEdgeShortening {
  const lock = clamp(args.attentionLock, 0, 1)
  const contrast = clamp(args.focusContrast, 0, 1)
  const sharp = clamp(args.focusSharpness, 0, 1)

  const shortening = clamp(lock * 0.62 + contrast * 0.22 + sharp * 0.14, 0, 1)
  const insetExtraPx = Math.round(4 + shortening * 10)
  const highlightDensity = clamp(1 + shortening * 0.26 + lock * 0.06, 1, 1.38)

  return { shortening, insetExtraPx, highlightDensity }
}
