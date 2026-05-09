import type { SentMessage } from '../state/messaging'
import type { Booking, Client, Service } from '../state/store'
import { todayISO } from '../state/store'

type FocusCTA =
  | { kind: 'open_calendar' }
  | { kind: 'open_reschedule'; bookingId: string; clientId: string; serviceId: string; masterId: string; dateISO: string; time: string }
  | { kind: 'open_message'; clientId: string }

export type FocusCardModel = {
  id: string
  title: string
  subtitle?: string
  badge?: string
  tone: 'gold' | 'ink'
  cta?: { label: string; action: FocusCTA }
}

export type HomeMode = 'calm' | 'busy'

export type HomeWidgets = {
  nextTime?: string
  freeSlotsCount: number
  incomeToday: number
  recoveryCount: number
  loadLevel: 'low' | 'medium' | 'high'
}

function minutesOf(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function nowMinutes() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.round(n)))
}

export function computeHomeMode(args: { todayBookings: number; remindersCount: number; eventsCount: number }): HomeMode {
  const { todayBookings, remindersCount, eventsCount } = args
  if (todayBookings >= 7) return 'busy'
  if (remindersCount >= 3) return 'busy'
  if (eventsCount >= 2) return 'busy'
  return 'calm'
}

export function buildFocusCard(args: {
  bookings: Booking[]
  clients: Client[]
  services: Service[]
  events: unknown[]
  sent: SentMessage[]
  masterId: string
  freeSlotsToday: string[]
  incomeToday: number
}): FocusCardModel {
  const { bookings, clients, services, masterId, freeSlotsToday, incomeToday } = args
  const today = todayISO()

  // 1) Soon booking within 60 minutes
  const upcoming = bookings
    .filter((b) => b.masterId === masterId && b.dateISO === today && b.status !== 'cancelled')
    .map((b) => ({ b, m: minutesOf(b.time) }))
    .filter((x) => x.m >= nowMinutes())
    .sort((a, b) => a.m - b.m)[0]?.b

  if (upcoming) {
    const delta = minutesOf(upcoming.time) - nowMinutes()
    if (delta <= 60) {
      const client = clients.find((c) => c.id === upcoming.clientId)?.name ?? 'Клиент'
      return {
        id: `focus_soon_${upcoming.id}`,
        tone: 'gold',
        badge: 'Фокус',
        title: `Через ${Math.max(1, delta)} мин запись`,
        subtitle: `${client} • ${upcoming.time}`,
        cta: { label: 'Открыть', action: { kind: 'open_calendar' } },
      }
    }
  }

  // 2) Reschedule pending
  const resched = bookings
    .filter((b) => b.masterId === masterId && b.status === 'reschedule_pending' && b.reschedule)
    .sort((a, b) => (a.reschedule!.proposedAt ?? 0) - (b.reschedule!.proposedAt ?? 0))[0]
  if (resched?.reschedule) {
    const client = clients.find((c) => c.id === resched.clientId)?.name ?? 'Клиент'
    const service = services.find((s) => s.id === resched.serviceId)?.name ?? 'Услуга'
    return {
      id: `focus_resched_${resched.id}`,
      tone: 'gold',
      badge: 'Важно',
      title: 'Ждём подтверждение переноса',
      subtitle: `${client} • ${service} • ${resched.reschedule.proposedTime}`,
      cta: {
        label: 'Изменить',
        action: {
          kind: 'open_reschedule',
          bookingId: resched.id,
          clientId: resched.clientId,
          serviceId: resched.serviceId,
          masterId: resched.masterId,
          dateISO: resched.dateISO,
          time: resched.time,
        },
      },
    }
  }

  // 3) Slot suggestion if there is free slot at 16:00/17:30/19:00
  const premium = freeSlotsToday.find((t) => ['16:00', '17:30', '19:00'].includes(t))
  if (premium) {
    return {
      id: `focus_premium_${today}_${premium}`,
      tone: 'gold',
      badge: 'Окно',
      title: `Есть свободное окно ${premium}`,
      subtitle: 'Можно заполнить одним касанием',
      cta: { label: 'Заполнить', action: { kind: 'open_message', clientId: clients[0]?.id ?? 'c1' } },
    }
  }

  // 4) Recovery value
  const inactive = clients.filter((c) => {
    const last = bookings
      .filter((b) => b.clientId === c.id && b.status !== 'cancelled')
      .sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time))
      .at(-1)?.dateISO
    if (!last) return false
    const [y1, m1, d1] = last.split('-').map(Number)
    const [y2, m2, d2] = today.split('-').map(Number)
    const a = new Date(y1, m1 - 1, d1).getTime()
    const b = new Date(y2, m2 - 1, d2).getTime()
    const days = Math.floor((b - a) / (1000 * 60 * 60 * 24))
    return days >= 28
  })
  if (inactive.length >= 2) {
    return {
      id: `focus_recovery_${today}`,
      tone: 'ink',
      badge: 'Возврат',
      title: `${inactive.length} клиента готовы к возврату`,
      subtitle: `Можно вернуть ~${money(incomeToday * 0.65)} ₽ мягким сценарием`,
      cta: { label: 'Открыть', action: { kind: 'open_calendar' } },
    }
  }

  // 5) Default calm focus
  return {
    id: `focus_calm_${today}`,
    tone: 'ink',
    badge: 'Спокойно',
    title: 'Сегодня всё под контролем',
    subtitle: 'Я покажу только важное — без лишних панелей',
  }
}

export function buildWidgets(args: {
  todayBookings: Booking[]
  freeSlotsToday: string[]
  incomeToday: number
  clients: Client[]
  bookings: Booking[]
}): HomeWidgets {
  const { todayBookings, freeSlotsToday, incomeToday, clients, bookings } = args
  const next = todayBookings
    .filter((b) => b.status !== 'cancelled')
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))[0]?.time

  const inactive = clients.filter((c) => {
    const last = bookings
      .filter((b) => b.clientId === c.id && b.status !== 'cancelled')
      .sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time))
      .at(-1)?.dateISO
    if (!last) return false
    const [y1, m1, d1] = last.split('-').map(Number)
    const [y2, m2, d2] = todayISO().split('-').map(Number)
    const a = new Date(y1, m1 - 1, d1).getTime()
    const b = new Date(y2, m2 - 1, d2).getTime()
    const days = Math.floor((b - a) / (1000 * 60 * 60 * 24))
    return days >= 28
  }).length

  const load = todayBookings.length >= 8 ? 'high' : todayBookings.length >= 5 ? 'medium' : 'low'

  return {
    nextTime: next,
    freeSlotsCount: freeSlotsToday.length,
    incomeToday,
    recoveryCount: inactive,
    loadLevel: load,
  }
}

