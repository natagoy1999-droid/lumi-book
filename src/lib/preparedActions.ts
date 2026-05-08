import type { OperationalIntent } from './workflowIntent'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))

}

export type PreparedComposerAmbient = {
  line: string
}

export type PreparedComposerHintInput = {
  primaryIntent: OperationalIntent
  predictiveReadiness: number
  intentConfidence: number
  cognitiveLoad: number
  trustSuppression: number
  communicationSoftness?: number
  followupDelicacy?: number
}

/**
 * Optional ambient line only — never injects draft text or sends messages.
 */
export function computePreparedComposerAmbient(
  input: PreparedComposerHintInput,
): PreparedComposerAmbient | null {
  if (input.predictiveReadiness < 0.64) return null
  if (input.intentConfidence < 0.48) return null
  if (input.cognitiveLoad > 0.56) return null
  if (input.trustSuppression > 0.52) return null

  const soft =
    (input.communicationSoftness ?? 0.5) > 0.62 || (input.followupDelicacy ?? 0.52) > 0.68

  switch (input.primaryIntent) {
    case 'followup_compose':
    case 'clients_deep':
      return {
        line: soft
          ? 'Спокойное продолжение диалога — текст полностью под вашим контролем.'
          : 'Можно спокойно править текст — отправка только по вашему действию.',
      }
    case 'reschedule_ops':
      return {
        line: 'Черновик можно собрать без спешки; интерфейс держит очередь.',
      }
    case 'pending_confirm_close':
      return {
        line: 'Короткие подтверждения удобнее проходить подряд — без лишних экранов.',
      }
    case 'schedule_tomorrow':
    case 'slot_seek':
      return {
        line: 'Контекст календаря сохранён — можно продолжить с того же места.',
      }
    default:
      return null
  }
}

/** Scalar “prepared workflow” feel — advisory only */
export function derivePreparedFlowStrength(
  predictiveReadiness: number,
  intentConfidence: number,
): number {
  return clamp(predictiveReadiness * (0.52 + intentConfidence * 0.48), 0, 1)
}
