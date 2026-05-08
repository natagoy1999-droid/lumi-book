import { dtAlpha, mix, readVarNumber, readVarPx, writeVarNumber, writeVarPx } from './coherencePhysics'

type SmoothState = {
  init: boolean
  lastMs: number
  ap: number
  pred: number
  dockGlow: number
  motionQuiet: number
  compactScale: number
  ctaGapPx: number
  quietDensity: number
  globalRhythm: number
}

const S: SmoothState = {
  init: false,
  lastMs: 0,
  ap: 0.55,
  pred: 0.72,
  dockGlow: 0.55,
  motionQuiet: 0,
  compactScale: 1,
  ctaGapPx: 8,
  quietDensity: 0.35,
  globalRhythm: 1,
}

export type GlobalSmoothingInput = {
  coherenceDamping: number // 0..1 (higher = slower, more stable)
}

/** Smooths a few global tokens so layers feel like one physics system. */
export function applyGlobalSmoothing(input: GlobalSmoothingInput) {
  const now =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()
  const dt = S.init ? Math.max(0, Math.min(120, now - S.lastMs)) : 16
  S.lastMs = now
  S.init = true

  // Larger damping → larger tau → slower changes.
  const d = Math.max(0, Math.min(1, input.coherenceDamping))
  const tau = 220 + d * 860
  const a = dtAlpha(dt, tau)

  const tAp = readVarNumber('--assistant-presence', 0.55)
  const tPred = readVarNumber('--predictive-opacity', 0.72)
  const tDockGlow = readVarNumber('--dock-glow-opacity', 0.55)
  const tMotionQ = readVarNumber('--motion-quietness', 0)
  const tCompact = readVarNumber('--compact-scale', 1)
  const tCtaGap = readVarPx('--cta-gap', 8)
  const tQuietDensity = readVarNumber('--quiet-density', 0.35)
  const tGlobalRhythm = readVarNumber('--global-rhythm', 1)

  S.ap = mix(S.ap, tAp, a)
  S.pred = mix(S.pred, tPred, a)
  S.dockGlow = mix(S.dockGlow, tDockGlow, a)
  S.motionQuiet = mix(S.motionQuiet, tMotionQ, a)
  S.compactScale = mix(S.compactScale, tCompact, a)
  S.ctaGapPx = mix(S.ctaGapPx, tCtaGap, a)
  S.quietDensity = mix(S.quietDensity, tQuietDensity, a)
  S.globalRhythm = mix(S.globalRhythm, tGlobalRhythm, a)

  writeVarNumber('--assistant-presence', S.ap)
  writeVarNumber('--predictive-opacity', S.pred)
  writeVarNumber('--dock-glow-opacity', S.dockGlow)
  writeVarNumber('--motion-quietness', S.motionQuiet)
  writeVarNumber('--compact-scale', S.compactScale)
  writeVarPx('--cta-gap', S.ctaGapPx)
  writeVarNumber('--quiet-density', S.quietDensity)
  writeVarNumber('--global-rhythm', S.globalRhythm)
}

