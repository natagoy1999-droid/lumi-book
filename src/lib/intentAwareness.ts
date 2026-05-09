import type { AssistantCard } from './assistantRecommendations'
import type { WorkflowIntentModel } from './workflowIntent'

import { useIntentIntel } from '../state/intentIntel'

import {
  isMasterCalendarPath,
  isMasterClientsPath,
  isMasterReschedulePath,
  isMasterTodayPath,
} from './appRoutes'

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function readVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

function isDismissed(id: string, dismissed: Record<string, { until?: number }>, now: number) {
  const v = dismissed[id]
  if (!v) return false
  if (!v.until) return true
  return v.until > now
}

/**
 * CSS tokens + intel snapshot — respects decision layer outputs (multi-intent dampening).
 */
export function applyIntentAwarenessLayer(model: WorkflowIntentModel) {
  const root = document.documentElement
  const choicePressure = readVar('--choice-pressure', 0.34)
  const multiDamp = clamp(choicePressure * 0.48, 0, 0.36)

  const activeIntent = clamp(model.activeIntentStrength * model.confidence * (1 - multiDamp * 0.55), 0, 1)
  const intentConfidence = clamp(model.confidence * (1 - multiDamp * 0.42), 0, 1)
  const intentFocus = clamp(
    0.32 + model.confidence * model.stability * 0.48 - multiDamp * 0.28,
    0,
    1,
  )
  const workflowIntent = clamp(model.activeIntentStrength * model.stability * (1 - multiDamp * 0.35), 0, 1)

  const intentLinearityRaw = clamp(
    0.26 +
      model.confidence * 0.44 +
      model.stability * 0.36 -
      multiDamp * 0.42 -
      (model.primary === 'neutral' ? 0.14 : 0),
    0,
    1,
  )

  root.style.setProperty('--active-intent', activeIntent.toFixed(3))
  root.style.setProperty('--intent-confidence', intentConfidence.toFixed(3))
  root.style.setProperty('--intent-focus', intentFocus.toFixed(3))
  root.style.setProperty('--workflow-intent', workflowIntent.toFixed(3))
  root.style.setProperty('--intent-linearity', intentLinearityRaw.toFixed(3))

  const baseFocusLin = readVar('--focus-linearity', 0.36)
  const mergedLin = clamp(baseFocusLin * 0.78 + intentLinearityRaw * 0.22, 0, 1)
  root.style.setProperty('--focus-linearity', mergedLin.toFixed(3))

  useIntentIntel.getState().setModel(model)
}

/**
 * Rare calm hint aligned with operational intent — never duplicates urgency cards.
 */
export function buildIntentGuidanceCard(args: {
  pathname: string
  cognitiveLoad: number
  aiConfidence: number
  intent: WorkflowIntentModel | null
  reschedulePending: number
  pendingConfirm: number
  composerOpen: boolean
  dismissed: Record<string, { until?: number }>
  now: number
}): AssistantCard | null {
  const {
    cognitiveLoad,
    aiConfidence,
    intent,
    pathname,
    reschedulePending,
    pendingConfirm,
    composerOpen,
    dismissed,
    now,
  } = args

  if (!intent || intent.primary === 'neutral') return null
  if (intent.confidence < 0.58 || intent.stability < 0.38) return null
  if (cognitiveLoad > 0.52) return null
  if (aiConfidence < 0.42) return null

  const bucket = Math.floor(now / (7 * 60 * 60 * 1000))
  const id = `intent_whisper_${bucket}_${intent.primary}`
  if (isDismissed(id, dismissed, now)) return null

  switch (intent.primary) {
    case 'reschedule_ops':
      if (isMasterReschedulePath(pathname) || reschedulePending < 1) return null
      return {
        id,
        kind: 'intent_whisper',
        priority: 13,
        tone: 'ink',
        title: 'Сейчас удобно закрывать переносы по списку',
        subtitle: 'Интерфейс держит очередь — без лишних развилок.',
      }
    case 'pending_confirm_close':
      if (pendingConfirm < 2 || !isMasterTodayPath(pathname)) return null
      return {
        id,
        kind: 'intent_whisper',
        priority: 13,
        tone: 'ink',
        title: 'Короткие подтверждения — можно по одному',
        subtitle: 'Спокойный порядок без перескоков экрана.',
      }
    case 'schedule_tomorrow':
      if (!isMasterCalendarPath(pathname)) return null
      return {
        id,
        kind: 'intent_whisper',
        priority: 13,
        tone: 'ink',
        title: 'Похоже, вы смотрите завтра',
        subtitle: 'Можно продолжить в том же темпе — без новых веток.',
      }
    case 'clients_deep':
      if (!isMasterClientsPath(pathname)) return null
      return {
        id,
        kind: 'intent_whisper',
        priority: 14,
        tone: 'ink',
        title: 'Работа с базой клиентов',
        subtitle: 'Вторичное спокойнее — чтобы не отвлекало от просмотра.',
      }
    case 'followup_compose':
      if (!composerOpen) return null
      return {
        id,
        kind: 'intent_whisper',
        priority: 14,
        tone: 'ink',
        title: 'Follow‑up в фокусе',
        subtitle: 'Остальное можно не разворачивать, пока готовите сообщение.',
      }
    case 'slot_seek':
      if (!pathname.includes('/calendar/new') && !isMasterCalendarPath(pathname)) return null
      return {
        id,
        kind: 'intent_whisper',
        priority: 13,
        tone: 'ink',
        title: 'Подбор окна — без лишних шагов',
        subtitle: 'Можно искать слот в том же контексте календаря.',
      }
    default:
      return null
  }
}
