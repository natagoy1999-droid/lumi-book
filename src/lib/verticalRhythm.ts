export type RhythmVars = {
  stackGapPx: number
  sectionGapPx: number
}

export function verticalRhythm(args: {
  mode: 'calm' | 'busy'
  density: 'comfortable' | 'compact' | 'ultraCompact'
}): RhythmVars {
  const { mode, density } = args
  const calm = mode === 'calm'

  const base = density === 'ultraCompact' ? 10 : density === 'compact' ? 12 : 14
  const stackGapPx = calm ? base + 2 : base
  const sectionGapPx = calm ? base + 6 : base + 3
  return { stackGapPx, sectionGapPx }
}

export function applyRhythm(v: RhythmVars) {
  const root = document.documentElement
  root.style.setProperty('--stack-gap', `${v.stackGapPx}px`)
  root.style.setProperty('--section-gap', `${v.sectionGapPx}px`)
}

