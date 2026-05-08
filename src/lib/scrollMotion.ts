export type ScrollVars = {
  glassBlurPx: number
  dockBorderOpacity: number
  glassBorderOpacity: number
  dockGlowOpacity: number
  compactScale: number
  dockShadow: string
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function computeScrollVars(scrollY: number): ScrollVars {
  // iOS-like: slightly easing into compactness
  const t = clamp((scrollY - 40) / 240, 0, 1)
  const ease = 1 - Math.pow(1 - t, 2) // easeOutQuad

  const glassBlurPx = lerp(18, 10, ease)
  const dockBorderOpacity = lerp(0.42, 0.62, ease)
  const glassBorderOpacity = lerp(0.40, 0.60, ease)
  const dockGlowOpacity = lerp(0.55, 0.28, ease)
  const compactScale = lerp(1.0, 0.985, ease)

  // shadow interpolation: denser, tighter while compact
  const shadowA = lerp(0.14, 0.18, ease)
  const shadowB = lerp(0.10, 0.12, ease)
  const dockShadow = `0 18px 44px rgba(10,12,16,${shadowA.toFixed(
    3,
  )}), 0 6px 18px rgba(10,12,16,${shadowB.toFixed(3)})`

  return {
    glassBlurPx,
    dockBorderOpacity,
    glassBorderOpacity,
    dockGlowOpacity,
    compactScale,
    dockShadow,
  }
}

export function applyScrollVars(vars: ScrollVars) {
  const root = document.documentElement
  root.style.setProperty('--glass-blur', `${vars.glassBlurPx.toFixed(1)}px`)
  root.style.setProperty('--dock-border-opacity', `${vars.dockBorderOpacity.toFixed(2)}`)
  root.style.setProperty('--glass-border-opacity', `${vars.glassBorderOpacity.toFixed(2)}`)
  root.style.setProperty('--dock-glow-opacity', `${vars.dockGlowOpacity.toFixed(2)}`)
  root.style.setProperty('--compact-scale', `${vars.compactScale.toFixed(3)}`)
  root.style.setProperty('--dock-shadow', vars.dockShadow)
}

