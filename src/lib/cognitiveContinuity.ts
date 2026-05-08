import { applyCognitiveRhythmCssVars, applyScreenRhythm } from './screenRhythm'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export type CognitiveContinuityInput = {
  pathname: string
  cognitiveLoad: number
  mentalQuietness: number
  quietDensity: number
  decisionDensity: number
  focusSimplicity: number
  ambientQuietness: number
}

/**
 * Global cognitive controller — mirrors intelligence into unified tokens every frame material runs.
 */
export function deriveGlobalQuietnessToken(input: CognitiveContinuityInput): number {
  return clamp(
    input.cognitiveLoad * 0.38 +
      input.mentalQuietness * 0.28 +
      input.ambientQuietness * 0.22 +
      input.focusSimplicity * 0.12,
    0,
    1,
  )
}

export function applyCognitiveContinuity(input: CognitiveContinuityInput) {
  const root = document.documentElement
  const gq = deriveGlobalQuietnessToken(input)

  root.style.setProperty('--global-cognitive-load', input.cognitiveLoad.toFixed(3))
  root.style.setProperty('--global-quietness', gq.toFixed(3))
  root.style.setProperty('--global-focus-density', input.quietDensity.toFixed(3))

  const motionQ = readVar('--motion-quietness', 0)
  const mirrored = clamp(motionQ * 0.55 + input.cognitiveLoad * 0.28 + input.mentalQuietness * 0.17, 0, 1)
  root.style.setProperty('--global-motion-quiet', mirrored.toFixed(3))

  applyScreenRhythm(input.pathname, input.cognitiveLoad)
  applyCognitiveRhythmCssVars()
}
