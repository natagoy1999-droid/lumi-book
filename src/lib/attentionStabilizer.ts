import { breathingIntensity, stillnessLevel, getVarNumber } from './breathingFreeze'
import { settleAmplitudePx } from './subPixelSettle'

export type AttentionStabilityVars = {
  breathing: number
  stillness: number
  settleAmpPx: number
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function computeAttentionStability(args: { dominantScore: number; pressure: number }): AttentionStabilityVars {
  const { dominantScore, pressure } = args
  const still = stillnessLevel({ dominantScore, pressure })
  const breathing = breathingIntensity({ dominantScore, pressure })

  const baseAmp = getVarNumber('--settle-amplitude', 0.9) // px
  const settleAmpPx = settleAmplitudePx({ basePx: baseAmp, stillness: still })

  return { breathing, stillness: still, settleAmpPx }
}

export function applyAttentionStability(v: AttentionStabilityVars) {
  const root = document.documentElement
  root.style.setProperty('--breathing-intensity', `${clamp(v.breathing, 0.08, 1).toFixed(3)}`)
  root.style.setProperty('--urgency-stillness', `${clamp(v.stillness, 0, 1).toFixed(3)}`)
  root.style.setProperty('--focus-stability', `${clamp(v.stillness, 0, 1).toFixed(3)}`)
  root.style.setProperty('--settle-amplitude', `${v.settleAmpPx.toFixed(2)}px`)
}

