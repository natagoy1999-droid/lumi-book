import type { AssistantCard } from './assistantRecommendations'

function isDismissed(id: string, dismissed: Record<string, { until?: number }>, now: number) {
  const v = dismissed[id]
  if (!v) return false
  if (!v.until) return true
  return v.until > now
}

/**
 * Rare, professional reassurance — no therapy tone, no emoji, no cheerleading.
 */
export function buildCalmReassuranceCard(args: {
  pathname: string
  stressPressure: number
  reassuranceLevel: number
  calmAssistance: number
  cognitiveLoad: number
  pendingCount: number
  bookingsTodayActive: number
  dismissed: Record<string, { until?: number }>
  now: number
}): AssistantCard | null {
  const {
    pathname,
    stressPressure,
    reassuranceLevel,
    calmAssistance,
    cognitiveLoad,
    pendingCount,
    bookingsTodayActive,
    dismissed,
    now,
  } = args

  if (pathname !== '/today') return null
  if (reassuranceLevel < 0.22 || calmAssistance < 0.38) return null
  if (cognitiveLoad > 0.66) return null

  const hourBucket = Math.floor(now / (6 * 60 * 60 * 1000))
  const id = `calm_reassurance_${hourBucket}_${Math.round(stressPressure * 20)}`
  if (isDismissed(id, dismissed, now)) return null

  const variant = hourBucket % 3

  if (variant === 0 && stressPressure > 0.48) {
    return {
      id,
      kind: 'calm_reassurance',
      priority: 13,
      tone: 'ink',
      title: 'Самое важное уже под контролем',
      subtitle:
        'Остальное можно разложить по очереди — без спешки и без лишних переключений.',
    }
  }

  if (variant === 1 && pendingCount <= 2 && bookingsTodayActive >= 3) {
    return {
      id,
      kind: 'calm_reassurance',
      priority: 13,
      tone: 'ink',
      title: 'На ближайшие два часа критичных задач нет',
      subtitle:
        'Срочное видно сверху в расписании; всё остальное можно сделать спокойно по порядку.',
    }
  }

  if (variant === 2 && stressPressure > 0.52 && stressPressure < 0.78) {
    return {
      id,
      kind: 'calm_reassurance',
      priority: 14,
      tone: 'ink',
      title: 'Ритм дня плотный, но он управляемый',
      subtitle:
        'Интерфейс оставляет один главный фокус — остальное не конкурирует за внимание.',
    }
  }

  if (reassuranceLevel > 0.42 && calmAssistance > 0.52) {
    return {
      id,
      kind: 'calm_reassurance',
      priority: 15,
      tone: 'ink',
      title: 'Сводка без сюрпризов',
      subtitle:
        `Сегодня ${bookingsTodayActive} запис${bookingsTodayActive === 1 ? 'ь' : 'ей'} — порядок уже собран; действуйте в своём темпе.`,
    }
  }

  return null
}
