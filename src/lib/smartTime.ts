import type { Booking } from '../state/store'
import { todayISO } from '../state/store'

export type SuggestedSlot = {
  dateISO: string
  time: string
  labelDay: string
  score: number
  reason: string
}

function addDaysISO(iso: string, delta: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function labelDay(targetISO: string) {
  const t = todayISO()
  if (targetISO === t) return 'Сегодня'
  if (targetISO === addDaysISO(t, 1)) return 'Завтра'
  return targetISO
}

function minutesOf(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

type Params = {
  masterId: string
  bookings: Booking[]
  freeSlots: (dateISO: string, masterId: string) => string[]
  horizonDays?: number
  limit?: number
  preferred?: 'morning' | 'day' | 'evening'
}

export function suggestBestSlots({
  masterId,
  bookings,
  freeSlots,
  horizonDays = 3,
  limit = 3,
  preferred,
}: Params): SuggestedSlot[] {
  const base = todayISO()
  const days = Array.from({ length: horizonDays }, (_, i) => addDaysISO(base, i))

  const out: SuggestedSlot[] = []

  for (const day of days) {
    const free = freeSlots(day, masterId)
    const dayBookings = bookings
      .filter((b) => b.masterId === masterId && b.dateISO === day && b.status !== 'cancelled')
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))

    const dayLoad = dayBookings.length
    const around = dayBookings.map((b) => minutesOf(b.time)).sort((a, b) => a - b)

    for (const t of free) {
      const m = minutesOf(t)

      let score = 0.65
      let reason = dayLoad <= 1 ? 'минимальная нагрузка дня' : 'мягкое окно'

      if (around.length >= 2) {
        let prev = -Infinity
        let next = Infinity
        for (const x of around) {
          if (x < m) prev = x
          if (x > m) {
            next = x
            break
          }
        }
        if (Number.isFinite(prev) && Number.isFinite(next)) {
          const inside = next - prev
          const toPrev = m - prev
          const toNext = next - m
          const centeredness = 1 - Math.abs(toPrev - toNext) / Math.max(1, inside)
          score = 0.78 + centeredness * 0.45
          reason = 'между двумя ближайшими клиентами'
        } else {
          score = 0.78
          reason = dayLoad >= 3 ? 'не ломает ритм дня' : 'минимальная нагрузка дня'
        }
      } else if (around.length === 1) {
        score = 0.82
        reason = dayLoad <= 1 ? 'минимальная нагрузка дня' : 'не ломает ритм дня'
      } else {
        score = 0.9
        reason = 'самый свободный день'
      }

      const today = todayISO()
      const dayBoost = day === today ? 0.06 : day === addDaysISO(today, 1) ? 0.04 : 0
      const loadPenalty = Math.min(0.2, dayLoad * 0.04)
      score = score + dayBoost - loadPenalty

      if (preferred) {
        const pref =
          preferred === 'morning'
            ? m < 12 * 60
            : preferred === 'day'
              ? m >= 12 * 60 && m < 17 * 60
              : m >= 17 * 60
        if (pref) score += 0.06
      }

      out.push({ dateISO: day, time: t, labelDay: labelDay(day), score, reason })
    }
  }

  return out.sort((a, b) => b.score - a.score).slice(0, limit)
}

