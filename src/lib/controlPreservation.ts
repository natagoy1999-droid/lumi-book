/**
 * Control preservation — Lumi только советует и смягчает трение; критические действия всегда за пользователем.
 *
 * Политика продукта (не runtime-enforced для каждой кнопки — ориентир для слоёв assistant/dock/booking).
 */
export const ADVISORY_ONLY_POLICY = {
  autonomousBooking: false,
  autonomousMessaging: false,
  autonomousRescheduleCommit: false,
  autonomousPayments: false,
} as const

export type AdvisorySurface = 'assistant' | 'dock' | 'composer' | 'behavioral'

/** Верхняя граница «автономности» UI — только усиление уже явных подсказок. */
export function maxAutonomousIntensity(aiConfidence: number): number {
  return Math.min(0.06, 0.035 + aiConfidence * 0.025)
}
