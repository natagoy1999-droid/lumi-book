function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type ContrastHierarchy = {
  dominantOpacity: number
  secondaryOpacity: number
  dominantBorder: number
  secondaryBorder: number
}

export function computeContrastHierarchy(args: {
  focusContrast: number // 0..1
  secondaryFade: number // 0..1
}) : ContrastHierarchy {
  const { focusContrast, secondaryFade } = args
  const fc = clamp(focusContrast, 0, 1)
  const sf = clamp(secondaryFade, 0, 1)

  const dominantOpacity = clamp(0.96 + fc * 0.06, 0.96, 1)
  const secondaryOpacity = clamp(0.96 - sf * 0.22, 0.72, 0.96)

  // Border opacity: dominant slightly sharper, secondary softer
  const dominantBorder = clamp(0.46 + fc * 0.20, 0.40, 0.68)
  const secondaryBorder = clamp(0.40 - sf * 0.16, 0.20, 0.40)

  return { dominantOpacity, secondaryOpacity, dominantBorder, secondaryBorder }
}

