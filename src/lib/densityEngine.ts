export type DockDensity = 'comfortable' | 'compact' | 'ultraCompact'

export type DensityVars = {
  dockHeightPx: number
  dockPadX: number
  dockPadY: number
  dockTitleSize: number
  dockSubtitleSize: number
  pillFontSize: number
  pillPadX: number
  pillPadY: number
  compactSpacing: number
  verticalRhythm: number
  layoutGravity: number
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function pickDockDensity(args: {
  scrollY: number
  mode: 'calm' | 'busy'
}): DockDensity {
  const { scrollY, mode } = args
  if (scrollY > 170) return 'ultraCompact'
  if (scrollY > 70) return 'compact'
  // busy mode starts slightly denser even at top
  return mode === 'busy' ? 'compact' : 'comfortable'
}

export function densityVars(args: { density: DockDensity; mode: 'calm' | 'busy' }): DensityVars {
  const { density, mode } = args

  const calm = mode === 'calm'

  if (density === 'comfortable') {
    return {
      dockHeightPx: 104,
      dockPadX: 16,
      dockPadY: 12,
      dockTitleSize: 14,
      dockSubtitleSize: 12,
      pillFontSize: 12,
      pillPadX: 14,
      pillPadY: 10,
      compactSpacing: 8,
      verticalRhythm: calm ? 1.08 : 1.02,
      layoutGravity: 1.0,
    }
  }

  if (density === 'compact') {
    return {
      dockHeightPx: 92,
      dockPadX: 14,
      dockPadY: 10,
      dockTitleSize: 13,
      dockSubtitleSize: 11.5,
      pillFontSize: 11.5,
      pillPadX: 13,
      pillPadY: 9,
      compactSpacing: 7,
      verticalRhythm: calm ? 1.04 : 0.98,
      layoutGravity: 1.06,
    }
  }

  // ultraCompact
  return {
    dockHeightPx: 78,
    dockPadX: 12,
    dockPadY: 8,
    dockTitleSize: 12.5,
    dockSubtitleSize: 11,
    pillFontSize: 11,
    pillPadX: 12,
    pillPadY: 8,
    compactSpacing: 6,
    verticalRhythm: calm ? 0.98 : 0.92,
    layoutGravity: 1.12,
  }
}

export function applyDensityVars(v: DensityVars) {
  const root = document.documentElement
  root.style.setProperty('--dock-height', `${v.dockHeightPx}px`)
  root.style.setProperty('--dock-pad-x', `${v.dockPadX}px`)
  root.style.setProperty('--dock-pad-y', `${v.dockPadY}px`)
  root.style.setProperty('--dock-title-size', `${v.dockTitleSize}px`)
  root.style.setProperty('--dock-subtitle-size', `${v.dockSubtitleSize}px`)
  root.style.setProperty('--pill-font', `${v.pillFontSize}px`)
  root.style.setProperty('--pill-pad-x', `${v.pillPadX}px`)
  root.style.setProperty('--pill-pad-y', `${v.pillPadY}px`)
  root.style.setProperty('--compact-spacing', `${v.compactSpacing}px`)
  root.style.setProperty('--vertical-rhythm', `${v.verticalRhythm}`)
  root.style.setProperty('--layout-gravity', `${v.layoutGravity}`)
  // Dock density is already a variable; we expose it for CSS usage as number-ish.
  root.style.setProperty('--dock-density', densityToNumber(v))
}

function densityToNumber(v: DensityVars) {
  // 1 = comfortable, <1 = denser
  const n = clamp(v.dockHeightPx / 104, 0.72, 1)
  return n.toFixed(3)
}

