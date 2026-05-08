import type { AssistantCard } from './assistantRecommendations'
import type { BehavioralSnapshot } from '../state/behavioralIntel'

import { explain } from './explainableHints'

function isDismissed(id: string, dismissed: Record<string, { until?: number }>, now: number) {
  const v = dismissed[id]
  if (!v) return false
  if (!v.until) return true
  return v.until > now
}

/**
 * Behavioral CSS tokens — consumed by rhythm/glass; values stay in whisper-quiet range.
 */
export function applyBehavioralTokens(s: BehavioralSnapshot) {
  const root = document.documentElement
  root.style.setProperty('--habit-confidence', s.habitConfidence.toFixed(3))
  root.style.setProperty('--predictive-focus', s.predictiveFocus.toFixed(3))
  root.style.setProperty('--behavioral-readiness', s.behavioralReadiness.toFixed(3))
  root.style.setProperty('--anticipation-level', s.anticipationLevel.toFixed(3))
  root.style.setProperty('--route-confidence', s.routeConfidence.toFixed(3))
}

/**
 * Rare anticipatory whisper — only when calm + enough confidence; capped by AssistantLayer slice.
 */
export function buildBehavioralWhisperCard(args: {
  pathname: string
  behavioral: BehavioralSnapshot | null
  cognitiveLoad: number
  aiConfidence: number
  trustSuppression: number
  dismissed: Record<string, { until?: number }>
  now: number
}): AssistantCard | null {
  const { pathname, behavioral, cognitiveLoad, dismissed, now } = args
  const ai = args.aiConfidence
  const sup = args.trustSuppression
  if (!behavioral) return null
  if (ai < 0.38) return null
  if (sup > 0.52 && ai < 0.54) return null
  if (cognitiveLoad > 0.52) return null
  if (behavioral.habitConfidence < 0.44 || behavioral.anticipationLevel < 0.26) return null

  const bucket = Math.floor(now / (4 * 60 * 60 * 1000))
  const id = `behavioral_whisper_${pathname}_${bucket}`
  if (isDismissed(id, dismissed, now)) return null

  const next = behavioral.suggestedNextPath
  const rc = behavioral.routeConfidence

  if (pathname === '/today' && next === '/calendar' && rc >= 0.34) {
    return {
      id,
      kind: 'behavioral_whisper',
      priority: 9,
      tone: 'ink',
      title: 'Обычно в это время вы заглядываете в календарь',
      subtitle: explain.calendarHabitBody,
    }
  }

  if (pathname === '/today' && next?.startsWith('/reschedule') && rc >= 0.32) {
    return {
      id,
      kind: 'behavioral_whisper',
      priority: 9,
      tone: 'ink',
      title: 'Похоже, сейчас типичное окно для переносов',
      subtitle: explain.rescheduleWindowBody,
    }
  }

  if (
    pathname === '/calendar' &&
    behavioral.predictiveFocus > 0.42 &&
    behavioral.habitConfidence > 0.5
  ) {
    return {
      id,
      kind: 'behavioral_whisper',
      priority: 10,
      tone: 'ink',
      title: 'Вы часто сверяете завтра после этого экрана',
      subtitle: explain.calendarTomorrowBody,
    }
  }

  if (
    (pathname === '/today' || pathname === '/clients') &&
    behavioral.predictiveFocus > 0.48 &&
    cognitiveLoad < 0.42
  ) {
    return {
      id,
      kind: 'behavioral_whisper',
      priority: 11,
      tone: 'ink',
      title: 'Тихий follow-up иногда приходит у вас в этот час',
      subtitle: explain.followUpHourBody,
    }
  }

  if (
    pathname === '/today' &&
    next === '/clients' &&
    rc >= 0.33 &&
    behavioral.habitConfidence > 0.52
  ) {
    return {
      id,
      kind: 'behavioral_whisper',
      priority: 10,
      tone: 'ink',
      title: 'Иногда после главного экрана вы проверяете клиентов',
      subtitle: explain.clientsAfterTodayBody,
    }
  }

  return null
}
