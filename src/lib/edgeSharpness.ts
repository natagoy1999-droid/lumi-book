function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type EdgeVars = {
  edgeSharpness: number // 0..1
  focusEdgeOpacity: number
  inkBorder: number
}

export function edgeSharpness(args: {
  focusSharpness: number // 0..1
  focusContrast: number // 0..1
  attentionLock: number // 0..1
}): EdgeVars {
  const s = clamp(args.focusSharpness, 0, 1)
  const c = clamp(args.focusContrast, 0, 1)
  const lock = clamp(args.attentionLock, 0, 1)

  // Higher focus -> sharper edge. Attention lock -> more stable, slightly sharper border but calmer highlight.
  const edgeSharpness = clamp(0.28 + s * 0.62 + c * 0.18, 0.2, 1)
  const focusEdgeOpacity = clamp(0.04 + s * 0.11 - lock * 0.04, 0.03, 0.12)
  const inkBorder = clamp(0.18 + edgeSharpness * 0.34 + lock * 0.06, 0.18, 0.7)

  return { edgeSharpness, focusEdgeOpacity, inkBorder }
}

