function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type EdgeLengthVars = {
  length: number // 0..1 (1 = long/soft, 0 = short/sharp)
  insetPx: number
}

export function edgeLength(args: {
  focusSharpness: number // 0..1
  focusContrast: number // 0..1
  attentionLock: number // 0..1
}): EdgeLengthVars {
  const s = clamp(args.focusSharpness, 0, 1)
  const c = clamp(args.focusContrast, 0, 1)
  const lock = clamp(args.attentionLock, 0, 1)

  // Higher focus -> shorter, cleaner edge.
  const focus = clamp(s * 0.6 + c * 0.4, 0, 1)
  const length = clamp(1 - focus * 0.55 - lock * 0.18, 0.28, 1)

  // Inset grows when length shrinks (shorter highlight).
  const insetPx = Math.round(10 + (1 - length) * 14) // 10..24

  return { length, insetPx }
}

