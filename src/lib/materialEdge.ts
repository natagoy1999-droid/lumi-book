function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type MaterialEdge = {
  edgeRgb: string // "r g b"
  edgeOpacity: number
}

export function materialEdge(args: {
  focusSharpness: number // 0..1
  attentionLock: number // 0..1
}): MaterialEdge {
  const s = clamp(args.focusSharpness, 0, 1)
  const lock = clamp(args.attentionLock, 0, 1)

  // iOS-like: visible only when focused, calmer when locked (no “shine”).
  const edgeOpacity = clamp(0.04 + s * 0.10 - lock * 0.04, 0.03, 0.12)
  return { edgeRgb: '255 255 255', edgeOpacity }
}

