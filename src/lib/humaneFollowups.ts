import { computeEveningBias } from './fatigueDetection'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export type FollowupDelicacyInput = {
  socialRhythm: number
  clientSensitivity: number
  stressPressure: number
  fatigueLevel: number
  pendingPressure: number
}

/**
 * Delicate follow-up stance — reduces perceived push without engagement hacks.
 */
export function deriveFollowupDelicacy(input: FollowupDelicacyInput): number {
  const evening = computeEveningBias(Date.now())
  const strain =
    input.stressPressure * 0.34 +
    input.fatigueLevel * 0.26 +
    input.pendingPressure * 0.28 +
    evening * 0.18

  return clamp(
    0.42 +
      input.socialRhythm * 0.28 +
      (1 - input.clientSensitivity) * 0.26 -
      strain * 0.42,
    0.12,
    0.96,
  )
}
