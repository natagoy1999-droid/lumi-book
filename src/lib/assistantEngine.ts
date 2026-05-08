import type { Client } from '../state/store'
import type { Booking } from '../state/store'
import { todayISO } from '../state/store'
import { computeClientInsights, inferPreferredBucket } from './clientInsights'
import { suggestBestSlots, type SuggestedSlot } from './smartTime'

function minutesOf(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function fmt(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type Gap = {
  start: string
  end: string
  minutes: number
}

export function computeDayGaps(args: {
  bookings: Booking[]
  masterId: string
  dateISO: string
  workStart?: string
  workEnd?: string
}): Gap[] {
  const { bookings, masterId, dateISO, workStart = '10:00', workEnd = '20:00' } = args
  const times = bookings
    .filter((b) => b.masterId === masterId && b.dateISO === dateISO && b.status !== 'cancelled')
    .map((b) => minutesOf(b.time))
    .sort((a, b) => a - b)

  const ws = minutesOf(workStart)
  const we = minutesOf(workEnd)
  const anchors = [ws, ...times, we]

  const gaps: Gap[] = []
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    const delta = b - a
    if (delta >= 60) gaps.push({ start: fmt(a), end: fmt(b), minutes: delta })
  }
  return gaps.sort((a, b) => b.minutes - a.minutes)
}

export function pickBestClientForSlot(args: {
  clients: Client[]
  bookings: Booking[]
  slot: { time: string }
}): Client | undefined {
  const { clients, bookings, slot } = args
  const m = minutesOf(slot.time)
  const bucket = m < 12 * 60 ? 'morning' : m < 17 * 60 ? 'day' : 'evening'

  let best: { client: Client; score: number } | undefined

  for (const c of clients) {
    const ins = computeClientInsights(bookings, c.id)
    let score = 0.5
    if (ins.preferredTime === bucket) score += 0.22
    if (ins.preferredTime === 'mixed') score += 0.06
    if (ins.likelihood === 'high') score += 0.18
    if (ins.likelihood === 'low') score -= 0.06
    if ((ins.daysSinceLast ?? 0) >= 42) score += 0.10 // recovery friendly
    // small bias to higher LTV
    score += Math.min(0.12, c.totalSpent / 100000)

    if (!best || score > best.score) best = { client: c, score }
  }
  return best?.client
}

export function suggestSlotsForClient(args: {
  masterId: string
  clientId: string
  clients: Client[]
  bookings: Booking[]
  freeSlots: (dateISO: string, masterId: string) => string[]
}): SuggestedSlot[] {
  const { masterId, clientId, clients, bookings, freeSlots } = args
  const c = clients.find((x) => x.id === clientId)
  const preferred = c ? inferPreferredBucket(computeClientInsights(bookings, c.id).preferredTime) : undefined
  return suggestBestSlots({ masterId, bookings, freeSlots, preferred, limit: 3, horizonDays: 3 })
}

export function isPremiumSlot(slot: { time: string }) {
  const m = minutesOf(slot.time)
  return m >= 17 * 60 && m <= 19 * 60
}

export function tomorrowISO() {
  const t = todayISO()
  const [y, m, d] = t.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + 1)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

