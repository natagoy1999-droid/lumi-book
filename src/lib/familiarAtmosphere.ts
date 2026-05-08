import { clamp } from './professionalComfort'

/**
 * Familiar atmosphere — maps long-run observation mass → familiarity strength for subtle UI bias.
 * No visible “learning” surfaces; comfort grows slowly and stays reversible.
 */
export function familiarityFromObservationMass(mass: number): number {
  return clamp(1 - Math.exp(-mass / 920), 0, 1)
}

export function atmosphereContinuityBias(familiarity: number): number {
  return familiarity * 0.08
}
