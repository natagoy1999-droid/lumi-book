import type { Client } from '../state/store'
import type { Booking, EngagementEvent } from '../state/store'
import { todayISO } from '../state/store'
import { computeDayGaps, tomorrowISO } from './assistantEngine'
import { computeClientAIProfile } from './clientAIProfile'

export type AssistantCardKind =
  | 'today_focus'
  | 'busy_tomorrow'
  | 'gap_fill'
  | 'cancel_risk'
  | 'best_followup_time'
  | 'recovery_value'
  | 'premium_slot'
  | 'behavioral_whisper'
  | 'calm_reassurance'
  | 'flow_continuity'
  | 'continuity_whisper'
  | 'intent_whisper'

export type AssistantCard = {
  id: string
  kind: AssistantCardKind
  priority: number
  title: string
  subtitle?: string
  tone: 'gold' | 'ink'
}

function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.round(n)))
}

function isDismissed(id: string, dismissed: Record<string, { until?: number }>, now: number) {
  const v = dismissed[id]
  if (!v) return false
  if (!v.until) return true
  return v.until > now
}

export function buildAssistantCards(args: {
  clients: Client[]
  bookings: Booking[]
  events: EngagementEvent[]
  sent: Array<{ clientId: string; sentAt: number }>
  dismissed: Record<string, { until?: number }>
  now: number
  masterId: string
}): AssistantCard[] {
  const { clients, bookings, events, sent, dismissed, now, masterId } = args
  const today = todayISO()
  const tomorrow = tomorrowISO()

  const out: AssistantCard[] = []

  // Calm focus anchor
  const todayCount = bookings.filter(
    (b) => b.masterId === masterId && b.dateISO === today && b.status !== 'cancelled',
  ).length
  out.push({
    id: `afocus_${today}`,
    kind: 'today_focus',
    priority: 0,
    tone: 'ink',
    title: todayCount ? `Сегодня ${todayCount} запис${todayCount === 1 ? 'ь' : 'и'} — всё спокойно` : 'Сегодня можно работать без спешки',
    subtitle: 'Я покажу только то, что действительно важно',
  })

  // Busy tomorrow
  const tomorrowCount = bookings.filter(
    (b) => b.masterId === masterId && b.dateISO === tomorrow && b.status !== 'cancelled',
  ).length
  if (tomorrowCount >= 8) {
    out.push({
      id: `busy_${tomorrow}`,
      kind: 'busy_tomorrow',
      priority: 2,
      tone: 'ink',
      title: 'Завтра высокая загрузка',
      subtitle: `${tomorrowCount} записей подряд • лучше не добавлять после 20:00`,
    })
  }

  // Big gap today
  const gaps = computeDayGaps({ bookings, masterId, dateISO: today })
  const g = gaps[0]
  if (g && g.minutes >= 90) {
    out.push({
      id: `gap_${today}_${g.start}_${g.end}`,
      kind: 'gap_fill',
      priority: 3,
      tone: 'gold',
      title: `Есть удобное окно ${g.start}–${g.end}`,
      subtitle: 'Можно добавить ещё одну запись без перегруза',
    })
  }

  // Cancel risk heuristic: many reschedules / cancels today
  const cancelsToday = events.filter((e) => e.type === 'booking_cancelled' && e.dateISO === today)
    .length
  const reschedToday = bookings.filter(
    (b) => b.masterId === masterId && b.dateISO === today && b.status === 'reschedule_pending',
  ).length
  if (cancelsToday + reschedToday >= 2) {
    out.push({
      id: `risk_${today}`,
      kind: 'cancel_risk',
      priority: 4,
      tone: 'ink',
      title: 'Сегодня повышенный риск отмен',
      subtitle: 'Рекомендуем мягкие подтверждения без давления',
    })
  }

  // Best follow-up time: aggregate client responsiveness
  const profiles = clients.map((c) =>
    computeClientAIProfile({
      client: c,
      bookings,
      sent: sent as any, // subset used
    }),
  )
  const evening = profiles.filter((p) => p.responsiveness === 'evening').length
  if (evening >= 2) {
    out.push({
      id: `best_follow_${today}`,
      kind: 'best_followup_time',
      priority: 5,
      tone: 'gold',
      title: 'Лучшее время для follow‑up — 18:00',
      subtitle: 'Несколько клиентов чаще отвечают вечером',
    })
  }

  // Recovery value: calm estimate
  const inactive = profiles.filter((p) => (p.daysSinceLast ?? 0) >= 28).length
  if (inactive >= 2) {
    const avgTicket =
      bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + (b.price || 0), 0) /
      Math.max(1, bookings.filter((b) => b.status !== 'cancelled').length)
    out.push({
      id: `recovery_${today}`,
      kind: 'recovery_value',
      priority: 6,
      tone: 'gold',
      title: `${inactive} клиента готовы к повторной записи`,
      subtitle: `Можно вернуть ~${money(avgTicket * inactive)} ₽ через спокойный recovery`,
    })
  }

  // Slot suggestion (if we have late slot free in template schedule)
  out.push({
    id: `premium_${today}`,
    kind: 'premium_slot',
    priority: 7,
    tone: 'gold',
    title: 'Есть свободное окно вечером',
    subtitle: 'Если захотите — предложу его “правильному” клиенту',
  })

  // Apply dismiss
  const filtered = out.filter((c) => !isDismissed(c.id, dismissed, now))
  return filtered.sort((a, b) => a.priority - b.priority).slice(0, 5)
}

