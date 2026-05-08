import type { Client } from '../state/store'
import type { ClientAIProfile } from './clientAIProfile'

export function recoveryScore(args: {
  client: Client
  profile: ClientAIProfile
  scenario: 'no_response' | 'cancel' | 'inactive' | 'first_visit' | 'reschedule'
}): number {
  const { client, profile, scenario } = args

  let score = 0

  // LTV weight
  score += Math.min(40, client.totalSpent / 1000) // 0..40

  // Likelihood weight
  score += profile.returnLikelihood === 'high' ? 28 : profile.returnLikelihood === 'medium' ? 18 : 10

  // Inactivity urgency
  const d = profile.daysSinceLast ?? 0
  if (d >= 42) score += 16
  else if (d >= 28) score += 10
  else if (d >= 14) score += 4

  // Cancel risk (for timing/approach)
  score += profile.cancelRisk === 'high' ? 4 : profile.cancelRisk === 'medium' ? 2 : 0

  // Scenario boosts
  if (scenario === 'no_response') score += 10
  if (scenario === 'reschedule') score += 12
  if (scenario === 'cancel') score += 11
  if (scenario === 'first_visit') score += 9
  if (scenario === 'inactive') score += 13

  return Math.round(score)
}

