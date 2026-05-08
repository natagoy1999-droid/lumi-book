import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, Sparkles, Wand2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { Sheet } from '../components/Sheet'
import { Skeleton } from '../components/Skeleton'
import { SwipeBack } from '../components/SwipeBack'
import { cn } from '../lib/cn'
import { useCognitiveUI } from '../state/cognitiveUI'
import { todayISO, useStore } from '../state/store'
import { uid as uidMsg, useMessaging } from '../state/messaging'

type Slot = { dateISO: string; time: string; score: number; reason: string }

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

function fmtBookingLine(serviceName: string, dayLabel: string, time: string) {
  return `${serviceName} • ${dayLabel} ${time}`
}

function proposeText(slot: Slot) {
  return `Предложить клиенту ${labelDay(slot.dateISO).toLowerCase()} ${slot.time}?`
}

export function Reschedule() {
  const showAmbientHints = useCognitiveUI((s) => s.policy.showAmbientHints)
  const nav = useNavigate()
  const { state, freeSlots, getClient, getService, getMaster, dispatch } = useStore()
  const openComposer = useMessaging((s) => s.openComposer)
  const [sp] = useSearchParams()

  // Optional deep-link params so screen can be opened from anywhere.
  const bookingId = sp.get('bookingId')
  const clientId = sp.get('clientId') ?? state.clients[0]?.id ?? 'c1'
  const serviceId = sp.get('serviceId') ?? state.services[0]?.id ?? 's1'
  const masterId = sp.get('masterId') ?? state.masters[0]?.id ?? 'm1'
  const currentDateISO = sp.get('date') ?? todayISO()
  const currentTime = sp.get('time') ?? '14:00'

  const client = getClient(clientId)
  const service = getService(serviceId)
  const master = getMaster(masterId)

  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Slot | null>(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 720)
    return () => clearTimeout(t)
  }, [])

  const candidateDays = useMemo(() => {
    const base = todayISO()
    return [base, addDaysISO(base, 1), addDaysISO(base, 2)]
  }, [])

  const slots = useMemo((): Slot[] => {
    const out: Slot[] = []

    for (const day of candidateDays) {
      const free = freeSlots(day, masterId)

      const dayBookings = state.bookings
        .filter((b) => b.dateISO === day && b.masterId === masterId)
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time))

      const dayLoad = dayBookings.length

      for (const t of free) {
        const m = minutesOf(t)
        const around = dayBookings.map((b) => minutesOf(b.time)).sort((a, b) => a - b)

        let gapScore = 0.6
        let reason = dayLoad <= 1 ? 'минимальная нагрузка дня' : 'мягкое окно'

        if (around.length >= 2) {
          // Find nearest neighbors.
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
            gapScore = 0.75 + centeredness * 0.45
            reason = 'между двумя ближайшими клиентами'
          } else {
            gapScore = 0.78
            reason = dayLoad >= 3 ? 'не ломает ритм дня' : 'минимальная нагрузка дня'
          }
        } else if (around.length === 1) {
          gapScore = 0.82
          reason = dayLoad <= 1 ? 'минимальная нагрузка дня' : 'не ломает ритм дня'
        } else {
          gapScore = 0.9
          reason = 'самый свободный день'
        }

        // Soft penalty for "today" late times if current booking is today.
        const today = todayISO()
        const isToday = day === today
        const latePenalty = isToday && m >= 18 * 60 ? 0.08 : 0

        // Small preference for near future (today/tomorrow).
        const dayBoost = day === today ? 0.06 : day === addDaysISO(today, 1) ? 0.04 : 0

        // Less load is calmer.
        const loadPenalty = Math.min(0.2, dayLoad * 0.04)

        const score = gapScore + dayBoost - loadPenalty - latePenalty

        out.push({ dateISO: day, time: t, score, reason })
      }
    }

    return out.sort((a, b) => b.score - a.score).slice(0, 8)
  }, [candidateDays, freeSlots, masterId, state.bookings])

  const grouped = useMemo(() => {
    const g = new Map<string, Slot[]>()
    for (const s of slots) {
      const key = labelDay(s.dateISO)
      const list = g.get(key) ?? []
      list.push(s)
      g.set(key, list)
    }
    return Array.from(g.entries()).map(([k, v]) => ({
      label: k,
      slots: v.sort((a, b) => a.time.localeCompare(b.time)),
    }))
  }, [slots])

  const best = slots[0]
  const noSlots = !loading && slots.length === 0

  const headerClient = client?.name ?? 'Клиент'
  const headerService = service?.name ?? 'Услуга'
  const headerDay = labelDay(currentDateISO)

  return (
    <SwipeBack className="h-[100svh]">
      <div className="px-5 pt-5 pb-28">
        <div className="mx-auto max-w-[520px]">
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-fog-200 px-3 py-2 text-[12px] font-medium text-ink-800/80 shadow-soft backdrop-blur-glass"
            >
              <ChevronLeft size={16} />
              Назад
            </button>

            <div className="text-right">
              <div className="text-[18px] font-semibold tracking-tightish text-ink-950">
                {headerClient}
              </div>
              <div className="mt-0.5 text-[12px] text-ink-700/65">
                {fmtBookingLine(headerService, headerDay, currentTime)}
              </div>
              <div className="mt-2 inline-flex items-center justify-end gap-2 text-[12px] font-medium text-ink-700/65">
                <div className="h-2 w-2 rounded-full bg-gold-300/60 shadow-glowGold" />
                {master?.name ?? 'Мастер'}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 44 }}
            className="mt-5 flex flex-col"
            style={{ gap: 'var(--cognitive-inline-stack)' }}
          >
            {showAmbientHints ? (
              <GlassCard className="p-5">
                <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">
                  Подберём новое время
                </div>
                <div className="mt-2 text-[18px] font-semibold tracking-tightish text-ink-950">
                  Лучшие окна — уже готовы
                </div>
                <div className="mt-1 text-[13px] leading-6 text-ink-700/65">
                  Lumi сама анализирует свободные слоты и предлагает спокойный вариант — без лишних действий.
                </div>
              </GlassCard>
            ) : null}

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-[88px]" />
                <Skeleton className="h-[136px]" />
                <Skeleton className="h-[136px]" />
              </div>
            ) : null}

            {!loading && best ? (
              <GlassCard className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
                      <Wand2 size={16} className="text-gold-400" />
                      AI-рекомендация
                    </div>
                    <div className="mt-2 text-[16px] font-semibold tracking-tightish text-ink-950">
                      Лучшее окно: {labelDay(best.dateISO).toLowerCase()} {best.time}
                    </div>
                    <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                      {best.reason === 'между двумя ближайшими клиентами'
                        ? `Между двумя ближайшими клиентами — аккуратный ритм без спешки.`
                        : `Рекомендуем ${best.time} — ${best.reason}.`}
                    </div>
                  </div>
                  <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 shadow-glowGold">
                    <Sparkles size={18} className="text-ink-950" />
                  </div>
                </div>
              </GlassCard>
            ) : null}

            {noSlots ? (
              <GlassCard className="p-5">
                <div className="text-[16px] font-semibold tracking-tightish text-ink-950">
                  Свободных окон пока нет
                </div>
                <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                  Lumi не нашла спокойных слотов на ближайшие дни. Можно открыть дополнительные часы — без ручных перестроений.
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                  onClick={() => nav('/settings')}
                  className="mt-4 w-full rounded-3xl bg-ink-950 px-5 py-4 text-[14px] font-medium text-paper-50 shadow-glowGold"
                >
                  Открыть дополнительные часы
                </motion.button>
              </GlassCard>
            ) : null}

            {!loading && !noSlots ? (
              <div className="space-y-3">
                {grouped.map((g) => (
                  <GlassCard key={g.label} className="p-5">
                    <div className="text-[12px] font-medium text-ink-700/70">{g.label}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {g.slots.map((s) => (
                        <motion.button
                          key={`${s.dateISO}_${s.time}`}
                          type="button"
                          whileTap={{ scale: 0.985, y: 1 }}
                          transition={{ type: 'spring', stiffness: 620, damping: 42 }}
                          onClick={() => {
                            setSelected(s)
                            setOpenConfirm(true)
                          }}
                          className={cn(
                            'rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[14px] font-semibold text-ink-950 shadow-soft',
                            'hover:bg-white/65',
                          )}
                        >
                          {s.time}
                        </motion.button>
                      ))}
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

      <Sheet
        open={openConfirm}
        title={selected ? proposeText(selected) : 'Отправить клиенту?'}
        onClose={() => setOpenConfirm(false)}
      >
        <div className="space-y-3">
          {selected ? (
            <div className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] leading-6 text-ink-700/70 shadow-soft">
              Lumi отправит аккуратное предложение и будет мягко ждать подтверждения — без вашей рутины.
            </div>
          ) : null}

          <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 600, damping: 40 }}
            onClick={() => {
              if (selected && bookingId) {
                const now = Date.now()
                dispatch({
                  type: 'proposeReschedule',
                  bookingId,
                  proposedDateISO: selected.dateISO,
                  proposedTime: selected.time,
                  at: now,
                })

                const c = client
                if (c) {
                  openComposer({
                    id: uidMsg('draft'),
                    kind: 'reschedule_offer',
                    clientId: c.id,
                    bookingId,
                    channel: 'whatsapp',
                    title: `Перенос • ${c.name}`,
                    text: `Здравствуйте, ${c.name}!\nЕсть аккуратное предложение по переносу: ${labelDay(selected.dateISO).toLowerCase()} в ${selected.time}.\n\nПодойдёт ли так?`,
                    createdAt: now,
                  })
                }
              }
              setOpenConfirm(false)
              setSuccess(true)
              setTimeout(() => setSuccess(false), 1300)
            }}
            className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold"
          >
            Предложить
          </motion.button>

          <button
            type="button"
            onClick={() => setOpenConfirm(false)}
            className="w-full rounded-3xl border border-white/60 bg-white/55 px-5 py-4 text-[15px] font-semibold text-ink-950 shadow-soft"
          >
            Выбрать другое
          </button>
        </div>
      </Sheet>

      <AnimatePresence>
        {success ? (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-ink-950/20 px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 12, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 520, damping: 44 }}
              className="w-full max-w-[520px] rounded-[30px] border border-white/50 bg-fog-100 p-6 shadow-lift backdrop-blur-glass ring-1 ring-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[12px] font-medium text-ink-700/80 shadow-soft">
                    <Check size={16} className="text-gold-400" />
                    Готово
                  </div>
                  <div className="mt-3 text-[18px] font-semibold tracking-tightish text-ink-950">
                    Новое время отправлено клиенту
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                    Lumi ждёт ответ и мягко напомнит при необходимости.
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/60 shadow-glowGold" />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SwipeBack>
  )
}

