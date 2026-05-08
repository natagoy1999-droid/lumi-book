import type { Booking } from '../state/store'
import { todayISO } from '../state/store'

export type ClientInsights = {
  preferredTime: 'morning' | 'day' | 'evening' | 'mixed'
  avgIntervalDays?: number
  daysSinceLast?: number
  likelihood: 'high' | 'medium' | 'low'
  label: string
}

function minutesOf(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function daysBetween(olderISO: string, newerISO: string) {
  const [y1, m1, d1] = olderISO.split('-').map(Number)
  const [y2, m2, d2] = newerISO.split('-').map(Number)
  const a = new Date(y1, m1 - 1, d1).getTime()
  const b = new Date(y2, m2 - 1, d2).getTime()
  return Math.floor((b - a) / (1000 * 60 * 60 * 24))
}

function bucket(min: number) {
  if (min < 12 * 60) return 'morning'
  if (min < 17 * 60) return 'day'
  return 'evening'
}

export function computeClientInsights(bookings: Booking[], clientId: string): ClientInsights {
  const list = bookings
    .filter((b) => b.clientId === clientId && b.status !== 'cancelled')
    .slice()
    .sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time))

  if (list.length === 0) {
    return {
      preferredTime: 'mixed',
      likelihood: 'medium',
      label: 'Профиль ещё формируется',
    }
  }

  // preferred time
  const counts: Record<'morning' | 'day' | 'evening', number> = {
    morning: 0,
    day: 0,
    evening: 0,
  }
  for (const b of list) counts[bucket(minutesOf(b.time))] += 1
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top = sorted[0][0] as 'morning' | 'day' | 'evening'
  const topShare = sorted[0][1] / Math.max(1, list.length)
  const preferredTime: ClientInsights['preferredTime'] = topShare >= 0.6 ? top : 'mixed'

  // avg interval
  const dates = list.map((b) => b.dateISO)
  const intervals: number[] = []
  for (let i = 1; i < dates.length; i++) {
    const delta = daysBetween(dates[i - 1], dates[i])
    if (delta > 0 && delta < 365) intervals.push(delta)
  }
  const avgIntervalDays =
    intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : undefined

  // days since last
  const last = dates[dates.length - 1]
  const today = todayISO()
  const daysSinceLast = daysBetween(last, today)

  // simple likelihood heuristic
  let score = 0.55
  if (list.length >= 5) score += 0.15
  if (list.length === 1) score -= 0.08
  if (avgIntervalDays && daysSinceLast <= avgIntervalDays + 6) score += 0.12
  if (daysSinceLast >= 42) score -= 0.12

  const likelihood: ClientInsights['likelihood'] =
    score >= 0.7 ? 'high' : score >= 0.56 ? 'medium' : 'low'

  const prefLabel =
    preferredTime === 'mixed'
      ? 'Клиент записывается в разное время'
      : preferredTime === 'morning'
        ? 'Клиент чаще записывается утром'
        : preferredTime === 'day'
          ? 'Клиент чаще записывается днём'
          : 'Клиент чаще записывается вечером'

  const intervalLabel =
    avgIntervalDays ? `Средний интервал визита — ${avgIntervalDays} дней` : 'Интервал визитов уточняется'

  const likeLabel =
    likelihood === 'high'
      ? 'Высокая вероятность повторной записи'
      : likelihood === 'medium'
        ? 'Средняя вероятность повторной записи'
        : 'Низкая вероятность повторной записи'

  return {
    preferredTime,
    avgIntervalDays,
    daysSinceLast,
    likelihood,
    label: `${prefLabel} • ${intervalLabel} • ${likeLabel}`,
  }
}

export function inferPreferredBucket(i: ClientInsights['preferredTime']) {
  if (i === 'mixed') return undefined
  return i
}

// no exports from internal helpers (keep API minimal)

