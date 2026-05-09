import type { AssistantCard } from './assistantRecommendations'

import { isMasterCalendarPath } from './appRoutes'

function isDismissed(id: string, dismissed: Record<string, { until?: number }>, now: number) {
  const v = dismissed[id]
  if (!v) return false
  if (!v.until) return true
  return v.until > now
}

/**
 * Gentle continuity whispers — only with real backlog + calm UI + trust; never naggy.
 */
export function buildGentleResumptionCard(args: {
  pathname: string
  cognitiveLoad: number
  aiConfidence: number
  unfinishedPressure: number
  contextMemoryScore: number
  reschedulePending: number
  pendingConfirm: number
  lastPrimaryPath: string
  justResumedFromBackground: boolean
  abandonedComposerAt: number | null
  dismissed: Record<string, { until?: number }>
  now: number
  /** Temporal orchestration — defer resume whisper until calm window */
  assistanceWindow?: number
  proactiveSuppression?: number
}): AssistantCard | null {
  const {
    cognitiveLoad,
    aiConfidence,
    unfinishedPressure,
    contextMemoryScore,
    reschedulePending,
    pendingConfirm,
    lastPrimaryPath,
    justResumedFromBackground,
    abandonedComposerAt,
    dismissed,
    now,
    assistanceWindow,
    proactiveSuppression,
  } = args

  if (cognitiveLoad > 0.52) return null
  if (aiConfidence < 0.44) return null
  if (unfinishedPressure < 0.28) return null
  if (contextMemoryScore < 0.35) return null

  const bucket = Math.floor(now / (8 * 60 * 60 * 1000))
  const baseId = `gentle_resume_${bucket}`

  if (
    justResumedFromBackground &&
    isMasterCalendarPath(lastPrimaryPath) &&
    pendingConfirm + reschedulePending > 0
  ) {
    const deferResume =
      (typeof assistanceWindow === 'number' && assistanceWindow < 0.38) ||
      (typeof proactiveSuppression === 'number' && proactiveSuppression > 0.58)
    if (!deferResume) {
      const id = `${baseId}_cal`
      if (!isDismissed(id, dismissed, now)) {
        return {
          id,
          kind: 'continuity_whisper',
          priority: 17,
          tone: 'ink',
          title: 'Вы недавно смотрели расписание',
          subtitle: 'Контекст дня сохранён — можно просто продолжить, когда будет удобно.',
        }
      }
    }
  }

  if (
    abandonedComposerAt &&
    now - abandonedComposerAt < 20 * 60 * 60 * 1000 &&
    unfinishedPressure > 0.34
  ) {
    const id = `${baseId}_msg`
    if (!isDismissed(id, dismissed, now)) {
      return {
        id,
        kind: 'continuity_whisper',
        priority: 18,
        tone: 'ink',
        title: 'Сообщение можно дописать позже',
        subtitle: 'Черновик не отправлялся — интерфейс не торопит и не напоминает серией алертов.',
      }
    }
  }

  return null
}
