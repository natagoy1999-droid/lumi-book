import type { FocusCardModel } from './homeEngine'
import type { Booking, Client } from '../state/store'
import { todayISO } from '../state/store'

export type PinnedItemKind = 'pending' | 'next' | 'premium_slot' | 'recovery' | 'urgent'

export type SmartPinnedItem = {
  id: string
  kind: PinnedItemKind
  text: string
  tone: 'gold' | 'ink'
}

export function pickSecondaryPinned(args: {
  focus: FocusCardModel
  clients: Client[]
  bookings: Booking[]
  freeSlotsToday: string[]
  incomeToday: number
}): SmartPinnedItem | null {
  const { focus, clients, bookings, freeSlotsToday } = args
  const today = todayISO()

  // Avoid duplicating the same signal already in focus
  const focusKey = focus.id

  // 1) Pending confirmation today
  const pending = bookings
    .filter((b) => b.dateISO === today && b.status === 'pending_confirm')
    .sort((a, b) => a.time.localeCompare(b.time))[0]
  if (pending && !focusKey.includes('pending')) {
    const name = clients.find((c) => c.id === pending.clientId)?.name ?? 'Клиент'
    return {
      id: `pin_pending_${pending.id}`,
      kind: 'pending',
      tone: 'gold',
      text: `Ждём подтверждение • ${pending.time} ${name}`,
    }
  }

  // 2) Premium slot
  const premium = freeSlotsToday.find((t) => ['16:00', '17:30', '19:00'].includes(t))
  if (premium && !focusKey.includes('premium')) {
    return { id: `pin_slot_${today}_${premium}`, kind: 'premium_slot', tone: 'gold', text: `${premium} свободно` }
  }

  // 3) Next booking
  const next = bookings
    .filter((b) => b.dateISO === today && b.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))[0]
  if (next && !focusKey.includes('soon') && !focusKey.includes('next')) {
    const name = clients.find((c) => c.id === next.clientId)?.name ?? 'Клиент'
    return { id: `pin_next_${next.id}`, kind: 'next', tone: 'ink', text: `${next.time} • ${name}` }
  }

  // 4) Recovery count (quiet)
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
  }).length
  if (inactive >= 2 && !focusKey.includes('recovery')) {
    return { id: `pin_recovery_${today}`, kind: 'recovery', tone: 'ink', text: `${inactive} recovery` }
  }

  return null
}

