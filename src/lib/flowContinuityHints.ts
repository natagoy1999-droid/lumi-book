import type { AssistantCard } from './assistantRecommendations'

function isDismissed(id: string, dismissed: Record<string, { until?: number }>, now: number) {
  const v = dismissed[id]
  if (!v) return false
  if (!v.until) return true
  return v.until > now
}

/**
 * Continuity assistance — minimal wording, no urgency theater, user stays in control.
 */
export function buildFlowContinuityCard(args: {
  pathname: string
  flowMomentum: number
  workflowCalm: number
  cognitiveLoad: number
  reschedulePending: number
  pendingConfirm: number
  dismissed: Record<string, { until?: number }>
  now: number
}): AssistantCard | null {
  const {
    pathname,
    flowMomentum,
    workflowCalm,
    cognitiveLoad,
    reschedulePending,
    pendingConfirm,
    dismissed,
    now,
  } = args

  if (flowMomentum < 0.5 || workflowCalm < 0.42) return null
  if (cognitiveLoad > 0.62) return null

  const bucket = Math.floor(now / (5 * 60 * 60 * 1000))
  const id = `flow_continuity_${bucket}_${pathname.replace(/\//g, '')}`

  if (reschedulePending >= 2) {
    const rid = `${id}_rs`
    if (!isDismissed(rid, dismissed, now)) {
      return {
        id: rid,
        kind: 'flow_continuity',
        priority: 11,
        tone: 'ink',
        title:
          reschedulePending === 2
            ? 'Осталось подтвердить два переноса'
            : `Осталось подтвердить переносов: ${reschedulePending}`,
        subtitle: 'Можно пройти по списку — интерфейс не торопит и не меняет порядок сам.',
      }
    }
  }

  if (pendingConfirm >= 2 && pathname === '/today') {
    const pid = `${id}_pc`
    if (!isDismissed(pid, dismissed, now)) {
      return {
        id: pid,
        kind: 'flow_continuity',
        priority: 12,
        tone: 'ink',
        title:
          pendingConfirm === 2
            ? 'Два клиента ждут короткого подтверждения'
            : `Подтверждений в очереди: ${pendingConfirm}`,
        subtitle: 'Следующий вероятный шаг — короткое сообщение; отправка только по вашему действию.',
      }
    }
  }

  return null
}
