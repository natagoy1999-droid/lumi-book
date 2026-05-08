function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type MaterialVars = {
  focusSharpness: number // 0..1
  materialDepth: number // 0..1
  depthOpacity: number // 0..1
  inkBorder: number // 0..1
}

export function materialPriority(args: {
  attentionLock: number
  focusContrast: number
  secondaryFade: number
  depthPriority: number
}): MaterialVars {
  const lock = clamp(args.attentionLock, 0, 1)
  const fc = clamp(args.focusContrast, 0, 1)
  const sf = clamp(args.secondaryFade, 0, 1)
  const dp = clamp(args.depthPriority, 0, 1)

  const focusSharpness = clamp(fc * 0.9 + lock * 0.25, 0, 1)
  const materialDepth = clamp(dp * 0.9 + sf * 0.35, 0, 1)
  const depthOpacity = clamp(1 - materialDepth * 0.12, 0.84, 1)
  const inkBorder = clamp(0.18 + focusSharpness * 0.34, 0.18, 0.62)

  return { focusSharpness, materialDepth, depthOpacity, inkBorder }
}

