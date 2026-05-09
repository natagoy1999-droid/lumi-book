import { AnimatePresence, motion } from 'framer-motion'
import {
  AlarmClock,
  CalendarClock,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
  TriangleAlert,
  UserRound,
  Wand2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTE_APP_CALENDAR, ROUTE_APP_RESCHEDULE } from '../lib/appRoutes'
import { advisoryShellOpacity, dockCtaShadowClass } from '../lib/advisoryDelicacy'
import { cn } from '../lib/cn'
import {
  nudgeClientLabel,
  offerAlternateTimeTitle,
  pendingBookingHeadline,
  rescheduleFollowupTitle,
} from '../lib/humaneWording'
import { computeClientInsights, inferPreferredBucket } from '../lib/clientInsights'
import { computeClientAIProfile } from '../lib/clientAIProfile'
import { generateMessageDraft } from '../lib/messageGenerator'
import { suggestBestSlots } from '../lib/smartTime'
import { computeDayGaps, isPremiumSlot, pickBestClientForSlot, tomorrowISO } from '../lib/assistantEngine'
import { useMessaging } from '../state/messaging'
import { useCommunicationCalmIntel } from '../state/communicationCalmIntel'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useSmartReminderUI } from '../state/smartReminders'
import { makeStep, useRecovery } from '../state/recovery'
import { todayISO, useStore, type Booking } from '../state/store'
import { GlassCard } from './GlassCard'
import { QuickActionBar, type QuickAction } from './QuickActionBar'

type Tone = 'gold' | 'ink'

type SmartReminder = {
  id: string
  tone: Tone
  priority: number
  title: string
  subtitle?: string
  kind:
    | 'not_confirmed'
    | 'soon'
    | 'free_slot'
    | 'stale_client'
    | 'busy_day'
    | 'reschedule_pending'
    | 'followup'
    | 'proactive'
  ctas: Array<{
    id: string
    label: string
    tone?: Tone
    onClick: () => void
  }>
  icon: React.ComponentType<{ size?: number; className?: string }>
}

function minutesOf(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function nowMinutes() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
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

function daysBetween(olderISO: string, newerISO: string) {
  const [y1, m1, d1] = olderISO.split('-').map(Number)
  const [y2, m2, d2] = newerISO.split('-').map(Number)
  const a = new Date(y1, m1 - 1, d1).getTime()
  const b = new Date(y2, m2 - 1, d2).getTime()
  return Math.floor((b - a) / (1000 * 60 * 60 * 24))
}

function isDismissed(id: string, dismissed: Record<string, { until?: number }>, now: number) {
  const v = dismissed[id]
  if (!v) return false
  if (!v.until) return true
  return v.until > now
}

function bestUpcomingToday(bookings: Booking[], masterId: string) {
  const t = todayISO()
  const now = nowMinutes()
  return bookings
    .filter((b) => b.dateISO === t && b.masterId === masterId)
    .map((b) => ({ b, m: minutesOf(b.time) }))
    .filter((x) => x.m >= now)
    .sort((a, b) => a.m - b.m)[0]?.b
}

export function SmartReminders({ hideWhenEmpty = false }: { hideWhenEmpty?: boolean }) {
  const nav = useNavigate()
  const socialQuietness = useCommunicationCalmIntel((s) => s.snapshot?.socialQuietness ?? 0.35)
  const { state, dispatch, getClient, getService } = useStore()
  const master = state.masters[0]
  const openComposer = useMessaging((s) => s.openComposer)
  const sent = useMessaging((s) => s.sent)
  const { ensureChain, completeStep, tick: tickChains } = useRecovery()

  // realtime feel (1/minute) + auto clear TTL dismissals
  const [tick, setTick] = useState(0)
  const { dismissed, dismiss, clearAllExpired } = useSmartReminderUI()

  useEffect(() => {
    const iv = setInterval(() => setTick((x) => x + 1), 60_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    clearAllExpired(Date.now())
    tickChains(Date.now())
  }, [tick, clearAllExpired])

  const reminders = useMemo((): SmartReminder[] => {
    const now = Date.now()
    const today = todayISO()
    const tomorrow = tomorrowISO()

    const out: SmartReminder[] = []

    // 2) Soon booking (today, within 60 minutes)
    const upcoming = bestUpcomingToday(state.bookings, master.id)
    if (upcoming) {
      const delta = minutesOf(upcoming.time) - nowMinutes()
      if (delta <= 60 && delta >= 0) {
        const client = getClient(upcoming.clientId)?.name ?? 'Клиент'
        out.push({
          id: `soon_${upcoming.id}`,
          kind: 'soon',
          tone: 'ink',
          priority: 0,
          title: `Через ${Math.max(1, delta)} мин запись с ${client}`,
          subtitle: `${getService(upcoming.serviceId)?.name ?? 'Услуга'} • сегодня ${upcoming.time}`,
          icon: AlarmClock,
          ctas: [
            {
              id: 'open',
              label: 'Открыть',
              tone: 'gold',
              onClick: () => nav(ROUTE_APP_CALENDAR),
            },
          ],
        })
      }
    }

    // 1) Not confirmed (today first)
    const pending = state.bookings
      .filter((b) => b.masterId === master.id && b.status === 'pending_confirm')
      .sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time))
    for (const b of pending.slice(0, 3)) {
      const client = getClient(b.clientId)?.name ?? b.clientName ?? 'Клиент'
      const service = getService(b.serviceId)?.name ?? b.serviceName ?? 'Услуга'
      const isToday = b.dateISO === today

      out.push({
        id: `pending_${b.id}`,
        kind: 'not_confirmed',
        tone: 'gold',
        priority: isToday ? 1 : 2,
        title: pendingBookingHeadline(client, socialQuietness),
        subtitle: `${service} • ${labelDay(b.dateISO).toLowerCase()} ${b.time}`,
        icon: TriangleAlert,
        ctas: [
          {
            id: 'nudge',
            label: nudgeClientLabel(socialQuietness),
            tone: 'gold',
            onClick: () => {
              dispatch({ type: 'nudgeBooking', bookingId: b.id, at: Date.now() })
              dismiss(`pending_${b.id}`, { ttlMs: 3 * 60 * 60 * 1000 }) // calm: hide for 3h

              const c = getClient(b.clientId)
              if (c) {
                const draft = generateMessageDraft({
                  kind: 'nudge_confirm',
                  channel: 'whatsapp',
                  client: c,
                  booking: b,
                  service: getService(b.serviceId),
                })
                openComposer(draft)
              }
            },
          },
          {
            id: 'reschedule',
            label: 'Перенести',
            onClick: () =>
              nav(
                `${ROUTE_APP_RESCHEDULE}?bookingId=${encodeURIComponent(b.id)}&clientId=${encodeURIComponent(
                  b.clientId,
                )}&serviceId=${encodeURIComponent(b.serviceId)}&masterId=${encodeURIComponent(
                  b.masterId,
                )}&date=${encodeURIComponent(b.dateISO)}&time=${encodeURIComponent(b.time)}`,
              ),
          },
          {
            id: 'cancel',
            label: 'Отменить',
            onClick: () => {
              dispatch({ type: 'cancelBooking', bookingId: b.id, at: Date.now(), addFreedSlotEvent: true })
              dismiss(`pending_${b.id}`)
            },
          },
        ],
      })
    }

    // 6) Awaiting reschedule confirmation
    const resched = state.bookings
      .filter((b) => b.masterId === master.id && b.status === 'reschedule_pending' && b.reschedule)
      .sort((a, b) => (a.reschedule!.proposedAt ?? 0) - (b.reschedule!.proposedAt ?? 0))
    for (const b of resched.slice(0, 2)) {
      const client = getClient(b.clientId)?.name ?? b.clientName ?? 'Клиент'
      const service = getService(b.serviceId)?.name ?? b.serviceName ?? 'Услуга'
      const p = b.reschedule!

      const ageMs = now - p.proposedAt
      const needs3h = ageMs >= 3 * 60 * 60 * 1000 && ageMs < 24 * 60 * 60 * 1000
      const needs24h = ageMs >= 24 * 60 * 60 * 1000

      // Recovery chain: no_response scenario
      const chainId = `chain_noresp_${b.id}`
      ensureChain({
        id: chainId,
        scenario: 'no_response',
        clientId: b.clientId,
        bookingId: b.id,
        createdAt: p.proposedAt,
        status: 'active',
        score: 0,
        steps: [
          makeStep('reminder_1', p.proposedAt + 3 * 60 * 60 * 1000),
          makeStep('offer_new_time', p.proposedAt + 24 * 60 * 60 * 1000),
          makeStep('soft_stop', p.proposedAt + 48 * 60 * 60 * 1000),
        ],
        note: 'No response chain',
      })

      if (needs3h) {
        out.push({
          id: `fu_resched_3h_${b.id}`,
          kind: 'followup',
          tone: 'gold',
          priority: 1,
          title: rescheduleFollowupTitle(socialQuietness),
          subtitle: `${client} • новое время: ${labelDay(p.proposedDateISO).toLowerCase()} ${p.proposedTime}`,
          icon: Sparkles,
          ctas: [
            {
              id: 'send',
              label: nudgeClientLabel(socialQuietness),
              tone: 'gold',
              onClick: () => {
                const c = getClient(b.clientId)
                if (!c) return
                const draft = generateMessageDraft({
                  kind: 'followup',
                  channel: 'whatsapp',
                  client: c,
                  booking: b,
                  service: getService(b.serviceId),
                })
                openComposer(draft)
                // mark step done
                const stepId = useRecovery
                  .getState()
                  .chains.find((x) => x.id === chainId)
                  ?.steps.find((s) => s.kind === 'reminder_1')?.id
                if (stepId) completeStep(chainId, stepId, Date.now())
                dismiss(`fu_resched_3h_${b.id}`, { ttlMs: 6 * 60 * 60 * 1000 })
              },
            },
            {
              id: 'later',
              label: 'Скрыть',
              onClick: () => dismiss(`fu_resched_3h_${b.id}`, { ttlMs: 6 * 60 * 60 * 1000 }),
            },
          ],
        })
      }

      if (needs24h) {
        out.push({
          id: `fu_resched_24h_${b.id}`,
          kind: 'followup',
          tone: 'ink',
          priority: 2,
          title: offerAlternateTimeTitle(socialQuietness),
          subtitle: `${client} • пока нет ответа • 24 часа`,
          icon: Wand2,
          ctas: [
            {
              id: 'change',
              label: 'Изменить',
              tone: 'gold',
              onClick: () =>
                nav(
                  `${ROUTE_APP_RESCHEDULE}?bookingId=${encodeURIComponent(b.id)}&clientId=${encodeURIComponent(
                    b.clientId,
                  )}&serviceId=${encodeURIComponent(b.serviceId)}&masterId=${encodeURIComponent(
                    b.masterId,
                  )}&date=${encodeURIComponent(b.dateISO)}&time=${encodeURIComponent(b.time)}`,
                ),
            },
            { id: 'hide', label: 'Скрыть', onClick: () => dismiss(`fu_resched_24h_${b.id}`, { ttlMs: 24 * 60 * 60 * 1000 }) },
          ],
        })
      }

      out.push({
        id: `resched_${b.id}`,
        kind: 'reschedule_pending',
        tone: 'gold',
        priority: 2,
        title: 'Ждём подтверждение клиента',
        subtitle: `${client} • ${service} • новое время: ${labelDay(p.proposedDateISO).toLowerCase()} ${p.proposedTime}`,
        icon: CalendarClock,
        ctas: [
          {
            id: 'nudge',
            label: nudgeClientLabel(socialQuietness),
            tone: 'gold',
            onClick: () => dismiss(`resched_${b.id}`, { ttlMs: 2 * 60 * 60 * 1000 }),
          },
          {
            id: 'edit',
            label: 'Изменить',
            onClick: () =>
              nav(
                `${ROUTE_APP_RESCHEDULE}?bookingId=${encodeURIComponent(b.id)}&clientId=${encodeURIComponent(
                  b.clientId,
                )}&serviceId=${encodeURIComponent(b.serviceId)}&masterId=${encodeURIComponent(
                  b.masterId,
                )}&date=${encodeURIComponent(b.dateISO)}&time=${encodeURIComponent(b.time)}`,
              ),
          },
        ],
      })
    }

    // 1b) Cancelled booking → offer new time
    const cancels = state.events
      .filter((e) => e.type === 'booking_cancelled' && e.masterId === master.id)
      .slice(0, 2) as Array<Extract<(typeof state.events)[number], { type: 'booking_cancelled' }>>
    for (const e of cancels) {
      const c = getClient(e.clientId)
      const s = getService(e.serviceId)
      if (!c) continue

      // Recovery chain: cancel scenario (pause → offer windows → soft stop)
      const chainId = `chain_cancel_${e.bookingId}`
      ensureChain({
        id: chainId,
        scenario: 'cancel',
        clientId: e.clientId,
        bookingId: e.bookingId,
        createdAt: e.at,
        status: 'active',
        score: 0,
        steps: [
          makeStep('offer_new_time', e.at + 2 * 60 * 60 * 1000),
          makeStep('soft_stop', e.at + 30 * 60 * 60 * 1000),
        ],
        note: 'Cancel recovery',
      })

      out.push({
        id: `cancel_${e.bookingId}`,
        kind: 'followup',
        tone: 'gold',
        priority: now - e.at >= 2 * 60 * 60 * 1000 ? 2 : 4,
        title: `${c.name} отменила запись`,
        subtitle: `${s?.name ?? 'Услуга'} • ${labelDay(e.dateISO).toLowerCase()} ${e.time}`,
        icon: CalendarClock,
        ctas: [
          {
            id: 'offer',
            label: 'Предложить новое время',
            tone: 'gold',
            onClick: () => {
              const insights = computeClientInsights(state.bookings, c.id)
              const slots = suggestBestSlots({
                masterId: master.id,
                bookings: state.bookings,
                freeSlots: (d, mId) => {
                  const work = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00']
                  const taken = new Set(
                    state.bookings
                      .filter((b) => b.dateISO === d && b.masterId === mId && b.status !== 'cancelled')
                      .map((b) => b.time),
                  )
                  return work.filter((t) => !taken.has(t))
                },
                preferred: inferPreferredBucket(insights.preferredTime),
              })
              const draft = generateMessageDraft({
                kind: 'reschedule_offer',
                channel: 'whatsapp',
                client: c,
                service: s,
                slots: slots.map((x) => ({ dateISO: x.dateISO, time: x.time, labelDay: x.labelDay })),
              })
              openComposer(draft)
              const stepId = useRecovery
                .getState()
                .chains.find((x) => x.id === chainId)
                ?.steps.find((st) => st.kind === 'offer_new_time')?.id
              if (stepId) completeStep(chainId, stepId, Date.now())
              dismiss(`cancel_${e.bookingId}`, { ttlMs: 24 * 60 * 60 * 1000 })
            },
          },
          {
            id: 'hide',
            label: 'Скрыть',
            onClick: () => dismiss(`cancel_${e.bookingId}`, { ttlMs: 24 * 60 * 60 * 1000 }),
          },
        ],
      })
    }

    // 3) Slot freed → suggest to offer clients
    const freed = state.events
      .filter((e) => e.type === 'slot_freed' && e.masterId === master.id)
      .slice(0, 1) as Array<Extract<(typeof state.events)[number], { type: 'slot_freed' }>>
    for (const e of freed) {
      const slot = { dateISO: e.dateISO, time: e.time, labelDay: labelDay(e.dateISO) }
      const candidate = pickBestClientForSlot({
        clients: state.clients,
        bookings: state.bookings,
        slot,
      })

      out.push({
        id: `slot_${e.dateISO}_${e.time}`,
        kind: 'free_slot',
        tone: 'gold',
        priority: 3,
        title: `Освободилось окно ${e.time}`,
        subtitle: `${labelDay(e.dateISO).toLowerCase()} • ${candidate ? `лучше предложить: ${candidate.name}` : 'можно предложить клиентам'}`,
        icon: Sparkles,
        ctas: [
          {
            id: 'propose',
            label: 'Предложить клиентам',
            tone: 'gold',
            onClick: () => {
              const targetClient = candidate ?? state.clients[0]
              if (!targetClient) return
              const draft = generateMessageDraft({
                kind: 'slot_offer',
                channel: 'whatsapp',
                client: targetClient,
                slot,
              })
              openComposer(draft)
              dismiss(`slot_${e.dateISO}_${e.time}`, { ttlMs: 6 * 60 * 60 * 1000 })
            },
          },
          { id: 'hide', label: 'Скрыть', onClick: () => dismiss(`slot_${e.dateISO}_${e.time}`, { ttlMs: 24 * 60 * 60 * 1000 }) },
        ],
      })
    }

    // 5) Busy day tomorrow
    const tomorrowCount = state.bookings.filter(
      (b) => b.masterId === master.id && b.dateISO === tomorrow,
    ).length
    if (tomorrowCount >= 8) {
      out.push({
        id: `busy_${tomorrow}`,
        kind: 'busy_day',
        tone: 'ink',
        priority: 5,
        title: 'Завтра высокая загрузка',
        subtitle: `${tomorrowCount} записей подряд`,
        icon: Wand2,
        ctas: [
          { id: 'open', label: 'Открыть', tone: 'gold', onClick: () => nav(ROUTE_APP_CALENDAR) },
        ],
      })
    }

    // 2b) Proactive: big calm gap today + premium slot hint
    const gaps = computeDayGaps({ bookings: state.bookings, masterId: master.id, dateISO: today })
    const bestGap = gaps[0]
    if (bestGap && bestGap.minutes >= 90) {
      out.push({
        id: `gap_${today}_${bestGap.start}_${bestGap.end}`,
        kind: 'proactive',
        tone: 'ink',
        priority: 4,
        title: 'Есть большое окно между клиентами',
        subtitle: `${bestGap.start}–${bestGap.end} • можно добавить ещё 1 запись`,
        icon: Sparkles,
        ctas: [
          {
            id: 'fill',
            label: 'Предложить окно',
            tone: 'gold',
            onClick: () => {
              const slotTime = isPremiumSlot({ time: bestGap.start }) ? bestGap.start : bestGap.end
              const candidate = pickBestClientForSlot({
                clients: state.clients,
                bookings: state.bookings,
                slot: { time: slotTime },
              })
              const targetClient = candidate ?? state.clients[0]
              if (!targetClient) return
              const draft = generateMessageDraft({
                kind: 'slot_offer',
                channel: 'whatsapp',
                client: targetClient,
                slot: { dateISO: today, time: bestGap.start, labelDay: 'Сегодня' },
              })
              openComposer(draft)
              dismiss(`gap_${today}_${bestGap.start}_${bestGap.end}`, { ttlMs: 6 * 60 * 60 * 1000 })
            },
          },
          { id: 'hide', label: 'Скрыть', onClick: () => dismiss(`gap_${today}_${bestGap.start}_${bestGap.end}`, { ttlMs: 24 * 60 * 60 * 1000 }) },
        ],
      })
    }

    // 4) Stale client (42+ days since last visit)
    const lastByClient = new Map<string, string>() // clientId -> dateISO
    for (const b of state.bookings) {
      if (b.status === 'cancelled') continue
      const prev = lastByClient.get(b.clientId)
      if (!prev || prev < b.dateISO) lastByClient.set(b.clientId, b.dateISO)
    }

    for (const c of state.clients) {
      const last = lastByClient.get(c.id)
      if (!last) continue
      const days = daysBetween(last, today)
      if (days >= 42) {
        // Recovery chain: inactive scenario (reengage → offer time → soft stop)
        const chainId = `chain_inactive_${c.id}`
        ensureChain({
          id: chainId,
          scenario: 'inactive',
          clientId: c.id,
          createdAt: now,
          status: 'active',
          score: 0,
          steps: [
            makeStep('reminder_1', now),
            makeStep('offer_new_time', now + 24 * 60 * 60 * 1000),
            makeStep('soft_stop', now + 14 * 24 * 60 * 60 * 1000),
          ],
          note: 'Inactive recovery',
        })

        out.push({
          id: `stale_${c.id}`,
          kind: 'stale_client',
          tone: 'gold',
          priority: 6,
          title:
            socialQuietness > 0.52
              ? `${c.name} давно не была у вас`
              : `${c.name} не была ${days} дней`,
          subtitle:
            socialQuietness > 0.52
              ? 'Можно спокойно написать, когда будет удобно'
              : 'Лёгкое сообщение — один тап',
          icon: UserRound,
          ctas: [
            {
              id: 'write',
              label: socialQuietness > 0.55 ? 'Спокойно продолжить' : 'Написать клиенту',
              tone: 'gold',
              onClick: () => {
                const profile = computeClientAIProfile({ client: c, bookings: state.bookings, sent })
                const insights = computeClientInsights(state.bookings, c.id)
                const slots = suggestBestSlots({
                  masterId: master.id,
                  bookings: state.bookings,
                  freeSlots: (d, mId) => {
                    const work = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00']
                    const taken = new Set(
                      state.bookings
                        .filter((b) => b.dateISO === d && b.masterId === mId && b.status !== 'cancelled')
                        .map((b) => b.time),
                    )
                    return work.filter((t) => !taken.has(t))
                  },
                  preferred: inferPreferredBucket(insights.preferredTime),
                })
                const draft = generateMessageDraft({
                  kind: 'reengage',
                  channel: 'whatsapp',
                  client: c,
                  slots: slots.map((x) => ({ dateISO: x.dateISO, time: x.time, labelDay: x.labelDay })),
                })
                // tiny predictive insight baked into note (best time)
                draft.meta = { bestTime: profile.bestMessageTime }
                openComposer(draft)
                const stepId = useRecovery
                  .getState()
                  .chains.find((x) => x.id === chainId)
                  ?.steps.find((st) => st.kind === 'reminder_1')?.id
                if (stepId) completeStep(chainId, stepId, Date.now())
                dismiss(`stale_${c.id}`, { ttlMs: 24 * 60 * 60 * 1000 })
              },
            },
          ],
        })
      }
    }

    // Filter dismissed
    const filtered = out.filter((r) => !isDismissed(r.id, dismissed, now))

    return filtered.sort((a, b) => a.priority - b.priority).slice(0, 16)
  }, [
    dismissed,
    dispatch,
    dismiss,
    getClient,
    getService,
    master.id,
    nav,
    openComposer,
    ensureChain,
    completeStep,
    sent,
    state.bookings,
    state.clients,
    state.events,
    socialQuietness,
    tick,
  ])

  const reminderCap = useCognitiveUI((s) => s.policy.reminderCap)
  const ctasPerReminder = useCognitiveUI((s) => s.policy.ctasPerReminder)
  const showQuickBar = useCognitiveUI((s) => s.policy.showQuickBar)

  const visibleReminders = useMemo(
    () => reminders.slice(0, reminderCap),
    [reminders, reminderCap],
  )

  const quickActions = useMemo((): QuickAction[] => {
    const top = visibleReminders[0]
    const actions: QuickAction[] = []

    if (top?.ctas?.length) {
      const primary = top.ctas[0]
      actions.push({
        id: `qa_${top.id}_${primary.id}`,
        label: primary.label,
        onClick: primary.onClick,
        tone: primary.tone ?? 'ink',
        icon: top.kind === 'followup' ? 'msg' : 'sparkle',
      })
    }

    const stale = visibleReminders.find((r) => r.kind === 'stale_client')
    if (stale?.ctas?.[0]) {
      actions.push({
        id: `qa_${stale.id}_${stale.ctas[0].id}`,
        label: stale.ctas[0].label,
        onClick: stale.ctas[0].onClick,
        tone: 'gold',
        icon: 'msg',
      })
    }

    const slot = visibleReminders.find((r) => r.kind === 'free_slot')
    if (slot?.ctas?.[0]) {
      actions.push({
        id: `qa_${slot.id}_${slot.ctas[0].id}`,
        label: slot.ctas[0].label,
        onClick: slot.ctas[0].onClick,
        tone: 'gold',
        icon: 'sparkle',
      })
    }

    return actions.slice(0, 4)
  }, [visibleReminders])

  if (!reminders.length) {
    if (hideWhenEmpty) return null
    return (
      <GlassCard className="p-5" style={{ opacity: advisoryShellOpacity() }}>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
            <Sparkles size={16} className="text-gold-400" />
            Smart reminders
          </div>
          <div className="text-[12px] text-ink-700/55">Появляется только по делу</div>
        </div>
        <div className="mt-4 rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft">
          <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
            Сегодня всё спокойно
          </div>
          <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
            Записи и напоминания под контролем
          </div>
        </div>
      </GlassCard>
    )
  }

  return (
    <>
      {showQuickBar ? <QuickActionBar actions={quickActions} /> : null}
      <GlassCard className="p-5" style={{ opacity: advisoryShellOpacity() }}>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
            <Sparkles size={16} className="text-gold-400" />
            Smart reminders
          </div>
          <div className="text-[12px] text-ink-700/55">Только полезные действия</div>
        </div>

        <motion.div layout className="mt-4 space-y-2">
          <AnimatePresence initial={false}>
            {visibleReminders.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                maxCtas={ctasPerReminder}
                onDismiss={() => dismiss(r.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </GlassCard>
    </>
  )
}

function ReminderCard({
  reminder,
  maxCtas,
  onDismiss,
}: {
  reminder: SmartReminder
  maxCtas: number
  onDismiss: () => void
}) {
  const socialQuietness = useCommunicationCalmIntel((s) => s.snapshot?.socialQuietness ?? 0.35)
  const Icon = reminder.icon

  const ctas = useMemo(() => {
    const sorted = [...reminder.ctas].sort(
      (a, b) => (a.tone === 'gold' ? 0 : 1) - (b.tone === 'gold' ? 0 : 1),
    )
    return sorted.slice(0, Math.max(1, maxCtas))
  }, [maxCtas, reminder.ctas])

  const toneRing =
    reminder.tone === 'gold'
      ? 'ring-1 ring-gold-200/60'
      : 'ring-1 ring-black/5'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 560, damping: 44, mass: 0.85 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 88 || Math.abs(info.velocity.x) > 900) onDismiss()
      }}
      className={cn(
        'relative rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft',
        'backdrop-blur-glass',
        toneRing,
      )}
    >
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-2xl border border-white/60 bg-white/55 p-2 text-ink-800/60 shadow-soft"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3 pr-10">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 shadow-soft">
          <Icon
            size={18}
            className={reminder.tone === 'gold' ? 'text-gold-400' : 'text-ink-800/70'}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
            {reminder.title}
          </div>
          {reminder.subtitle ? (
            <div className="mt-0.5 text-[12px] leading-5 text-ink-700/65">
              {reminder.subtitle}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {ctas.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 650, damping: 42 }}
                onClick={c.onClick}
                className={cn(
                  'rounded-3xl px-4 py-2 text-[13px] font-semibold shadow-soft',
                  c.tone === 'gold'
                    ? cn('bg-ink-950 text-paper-50', dockCtaShadowClass(socialQuietness))
                    : 'border border-white/60 bg-white/55 text-ink-950',
                )}
              >
                {c.label}
              </motion.button>
            ))}
            <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/40 px-3 py-2 text-[11px] font-medium text-ink-700/60">
              <CheckCircle2 size={14} className="text-gold-400" />
              1 действие
            </div>
          </div>

          {reminder.kind === 'stale_client' ? (
            <div className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/60">
              <MessageSquareText size={14} className="text-gold-400" />
              Текст уже подготовлен в спокойном премиум-тоне
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

