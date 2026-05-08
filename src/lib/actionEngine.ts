import type { Booking, Client, EngagementEvent } from '../state/store'
import { todayISO } from '../state/store'
import { computeClientAIProfile } from './clientAIProfile'
import { scoreCTA, type CTASignal } from './ctaPriority'

export type DockActionKind =
  | { kind: 'nudge_pending'; bookingId: string; clientId: string }
  | { kind: 'offer_slot'; dateISO: string; time: string; clientId?: string }
  | { kind: 'write_client'; clientId: string }
  | { kind: 'open_reschedule'; bookingId: string; clientId: string; serviceId: string; masterId: string; dateISO: string; time: string }

export type DockAction = {
  id: string
  label: string
  tone: 'gold' | 'ink'
  kind: DockActionKind
  score: number
}

function minutesOf(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function nowMinutes() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function isPremiumTime(t: string) {
  const m = minutesOf(t)
  return m >= 17 * 60 && m <= 19 * 60
}

export function buildDockActions(args: {
  bookings: Booking[]
  clients: Client[]
  events: EngagementEvent[]
  sent: Array<{ clientId: string; sentAt: number }>
  masterId: string
}): DockAction[] {
  const { bookings, clients, events, sent, masterId } = args
  const today = todayISO()

  const actions: DockAction[] = []

  // pending confirmation today → nudge
  const pending = bookings
    .filter((b) => b.masterId === masterId && b.dateISO === today && b.status === 'pending_confirm')
    .sort((a, b) => a.time.localeCompare(b.time))[0]
  if (pending) {
    const minTo = minutesOf(pending.time) - nowMinutes()
    const signal: CTASignal = { kind: 'pending_confirm', minutesTo: minTo, price: pending.price }
    actions.push({
      id: `cta_nudge_${pending.id}`,
      label: 'Напомнить',
      tone: 'gold',
      kind: { kind: 'nudge_pending', bookingId: pending.id, clientId: pending.clientId },
      score: scoreCTA(signal),
    })
  }

  // freed slot → propose
  const freed = events.find((e) => e.type === 'slot_freed' && e.masterId === masterId)
  if (freed) {
    const signal: CTASignal = { kind: 'slot_freed', premium: isPremiumTime(freed.time) }
    actions.push({
      id: `cta_offer_${freed.dateISO}_${freed.time}`,
      label: 'Предложить',
      tone: 'gold',
      kind: { kind: 'offer_slot', dateISO: freed.dateISO, time: freed.time },
      score: scoreCTA(signal),
    })
  }

  // inactive (42+ days) → write
  const profiles = clients.map((c) => ({
    client: c,
    profile: computeClientAIProfile({ client: c, bookings, sent: sent as any }),
  }))
  const inactive = profiles
    .filter((x) => (x.profile.daysSinceLast ?? 0) >= 42)
    .sort((a, b) => b.client.totalSpent - a.client.totalSpent)[0]
  if (inactive) {
    const signal: CTASignal = {
      kind: 'inactive',
      daysSinceLast: inactive.profile.daysSinceLast ?? 42,
      ltv: inactive.client.totalSpent,
      likelihood: inactive.profile.returnLikelihood,
    }
    actions.push({
      id: `cta_write_${inactive.client.id}`,
      label: 'Написать',
      tone: 'gold',
      kind: { kind: 'write_client', clientId: inactive.client.id },
      score: scoreCTA(signal),
    })
  }

  // reschedule pending older → change
  const resched = bookings
    .filter((b) => b.masterId === masterId && b.status === 'reschedule_pending' && b.reschedule)
    .sort((a, b) => (a.reschedule!.proposedAt ?? 0) - (b.reschedule!.proposedAt ?? 0))[0]
  if (resched?.reschedule) {
    const ageHours = (Date.now() - resched.reschedule.proposedAt) / (60 * 60 * 1000)
    const signal: CTASignal = { kind: 'reschedule_pending', ageHours, price: resched.price }
    actions.push({
      id: `cta_resched_${resched.id}`,
      label: 'Перенести',
      tone: 'ink',
      kind: {
        kind: 'open_reschedule',
        bookingId: resched.id,
        clientId: resched.clientId,
        serviceId: resched.serviceId,
        masterId: resched.masterId,
        dateISO: resched.dateISO,
        time: resched.time,
      },
      score: scoreCTA(signal),
    })
  }

  return actions.sort((a, b) => b.score - a.score).slice(0, 3)
}

