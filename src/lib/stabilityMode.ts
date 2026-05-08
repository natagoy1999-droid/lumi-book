import { computeCalmUrgency } from './calmUrgency'

export type StabilityMode = {
  calmUrgency: boolean
  stillness: number
}

export function stabilityMode(args: { minutesToNext?: number; dominantScore: number; pressure: number }): StabilityMode {
  const v = computeCalmUrgency(args)
  const calmUrgency = v.stillness >= 0.55
  return { calmUrgency, stillness: v.stillness }
}

