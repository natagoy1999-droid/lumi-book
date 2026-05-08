import type { SentMessage } from '../state/messaging'
import type { Booking, Client } from '../state/store'
import { todayISO } from '../state/store'
import { computeClientInsights } from './clientInsights'

export type Responsiveness = 'morning' | 'day' | 'evening' | 'unknown'
export type CancelRisk = 'low' | 'medium' | 'high'

export type ClientAIProfile = {
  clientId: string
  preferredTime: 'morning' | 'day' | 'evening' | 'mixed'
  responsiveness: Responsiveness
  bestMessageTime: string // HH:MM
  cancelRisk: CancelRisk
  returnLikelihood: 'high' | 'medium' | 'low'
  avgIntervalDays?: number
  daysSinceLast?: number
  preferredDay?: 'weekday' | 'weekend' | 'mixed'
}

function hourOf(ts: number) {
  return new Date(ts).getHours()
}

function bucketHour(h: number): Responsiveness {
  if (h >= 18 || h < 6) return 'evening'
  if (h < 12) return 'morning'
  return 'day'
}

function bestTimeFromBucket(b: Responsiveness) {
  if (b === 'morning') return '11:30'
  if (b === 'day') return '15:00'
  if (b === 'evening') return '18:00'
  return '18:00'
}

function daysBetween(olderISO: string, newerISO: string) {
  const [y1, m1, d1] = olderISO.split('-').map(Number)
  const [y2, m2, d2] = newerISO.split('-').map(Number)
  const a = new Date(y1, m1 - 1, d1).getTime()
  const b = new Date(y2, m2 - 1, d2).getTime()
  return Math.floor((b - a) / (1000 * 60 * 60 * 24))
}

export function computeClientAIProfile(args: {
  client: Client
  bookings: Booking[]
  sent: SentMessage[]
}): ClientAIProfile {
  const { client, bookings, sent } = args

  const base = computeClientInsights(bookings, client.id)

  // Responsiveness: infer from when messages were sent (proxy for typical contact window)
  const sentToClient = sent.filter((m) => m.clientId === client.id).slice(0, 30)
  const counts: Record<Responsiveness, number> = { morning: 0, day: 0, evening: 0, unknown: 0 }
  for (const m of sentToClient) counts[bucketHour(hourOf(m.sentAt))] += 1
  const bestBucket = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'unknown') as Responsiveness
  const responsiveness = sentToClient.length >= 3 ? bestBucket : 'unknown'

  const bestMessageTime = bestTimeFromBucket(responsiveness === 'unknown' ? 'evening' : responsiveness)

  // Preferred booking day (weekday/weekend)
  const bks = bookings
    .filter((b) => b.clientId === client.id && b.status !== 'cancelled')
    .slice()
  let weekday = 0
  let weekend = 0
  for (const b of bks) {
    const [y, m, d] = b.dateISO.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    const isWeekend = dow === 0 || dow === 6
    if (isWeekend) weekend += 1
    else weekday += 1
  }
  const preferredDay =
    bks.length >= 3
      ? weekend / bks.length >= 0.6
        ? 'weekend'
        : weekday / bks.length >= 0.6
          ? 'weekday'
          : 'mixed'
      : 'mixed'

  // Cancel risk: heuristic based on cancellations/reschedules events in bookings
  const total = Math.max(1, bks.length)
  const cancels = bookings.filter((b) => b.clientId === client.id && b.status === 'cancelled').length
  const resched = bookings.filter((b) => b.clientId === client.id && b.status === 'reschedule_pending').length
  let riskScore = cancels / total + resched / total / 2
  if ((base.daysSinceLast ?? 0) >= 42) riskScore += 0.08
  const cancelRisk: CancelRisk = riskScore >= 0.35 ? 'high' : riskScore >= 0.18 ? 'medium' : 'low'

  // return likelihood from base
  const returnLikelihood = base.likelihood

  // days since last (ensure computed even for 1 booking)
  const lastDate = bks.sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time)).at(-1)?.dateISO
  const daysSinceLast = lastDate ? daysBetween(lastDate, todayISO()) : undefined

  return {
    clientId: client.id,
    preferredTime: base.preferredTime,
    responsiveness,
    bestMessageTime,
    cancelRisk,
    returnLikelihood,
    avgIntervalDays: base.avgIntervalDays,
    daysSinceLast,
    preferredDay,
  }
}

