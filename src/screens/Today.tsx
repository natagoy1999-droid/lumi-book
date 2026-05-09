import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { DayTimeline } from '../components/DayTimeline'
import { AssistantLayer } from '../components/AssistantLayer'
import { RecoveryDashboard } from '../components/RecoveryDashboard'
import { SmartReminders } from '../components/SmartReminders'
import { FocusCard } from '../components/FocusCard'
import { MiniWidgets } from '../components/MiniWidgets'
import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import { buildFocusCard, buildWidgets, computeHomeMode } from '../lib/homeEngine'
import { kickMotionDecay } from '../lib/motionDecay'
import { useMessaging } from '../state/messaging'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useInteractionTelemetry } from '../state/interactionTelemetry'
import { useMaterialScroll } from '../state/materialScroll'
import { todayISO, useStore } from '../state/store'
function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n)
}

export function Today() {
  const nav = useNavigate()
  const { state, getClient, getMaster, getService, moneyForDay, freeSlots } = useStore()
  const sent = useMessaging((s) => s.sent)
  const dateISO = todayISO()
  const [logoOk, setLogoOk] = useState(true)
  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date())
  }, [])

  const master = state.masters[0]
  const slots = freeSlots(dateISO, master.id)

  const nextBooking = useMemo(() => {
    const b = state.bookings
      .filter((x) => x.dateISO === dateISO && x.masterId === master.id)
      .sort((a, b) => a.time.localeCompare(b.time))[0]
    return b
  }, [dateISO, master.id, state.bookings])

  const bookingsToday = state.bookings.filter((b) => b.dateISO === dateISO)
  const income = moneyForDay(dateISO)

  const [compact, setCompact] = useState(false)

  const homeMode = useMemo(() => {
    // quick proxy: bookings + events + “pending”
    const remindersCount = state.bookings.filter(
      (b) => b.status === 'pending_confirm' || b.status === 'reschedule_pending',
    ).length
    return computeHomeMode({
      todayBookings: bookingsToday.filter((b) => b.status !== 'cancelled').length,
      remindersCount,
      eventsCount: state.events.length,
    })
  }, [bookingsToday, state.bookings, state.events.length])

  const focus = useMemo(() => {
    return buildFocusCard({
      bookings: state.bookings,
      clients: state.clients,
      services: state.services,
      events: state.events,
      sent,
      masterId: master.id,
      freeSlotsToday: slots,
      incomeToday: income,
    })
  }, [income, master.id, sent, slots, state.bookings, state.clients, state.events, state.services])

  const widgets = useMemo(() => {
    return buildWidgets({
      todayBookings: bookingsToday,
      freeSlotsToday: slots,
      incomeToday: income,
      clients: state.clients,
      bookings: state.bookings,
    })
  }, [bookingsToday, income, slots, state.bookings, state.clients])

  const cognitivePolicy = useCognitiveUI((s) => s.policy)
  const cardPad = cognitivePolicy.load > 0.53 ? 'p-5' : 'p-6'
  const setMaterialScrollY = useMaterialScroll((s) => s.setScrollY)
  const sampleScrollTelemetry = useInteractionTelemetry((s) => s.sampleScroll)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      setCompact(y > 56)
      setMaterialScrollY(y)
      sampleScrollTelemetry(y)
      kickMotionDecay()
    }
    // Avoid “restored scroll” causing a floating dock overlap on first paint.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    setCompact(false)
    setMaterialScrollY(0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sampleScrollTelemetry, setMaterialScrollY])

  const shellPadTop =
    'calc(var(--safe-top, 0px) + 2.25rem * (0.94 + var(--global-rhythm, 1) * 0.06))'

  return (
    <div
      className="px-5"
      style={{
        paddingTop: shellPadTop,
        paddingBottom: '0px',
      }}
    >
      <div className="mx-auto max-w-[520px]">
        {/* Floating FocusDock disabled on Today (mobile-first clean layout). */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: Math.round(528 - cognitivePolicy.load * 76),
            damping: Math.round(44 + cognitivePolicy.load * 10),
          }}
          className="w-full"
          style={{
            marginBottom: 'calc(var(--cognitive-inline-stack) * 2.06 * (1 - var(--global-focus-density, 0.35) * 0.12))',
          }}
        >
          <div className="w-full">
            <div
              className="flex w-full items-center justify-center"
              style={{ marginBottom: '20px' }}
            >
              {logoOk ? (
                <img
                  src="/lumi-logo-transparent.png"
                  alt="LUMI BOOK"
                  className="h-auto object-contain"
                  style={{ width: 180, maxWidth: '70vw' }}
                  draggable={false}
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <div className="text-[18px] font-semibold tracking-tightish text-ink-950">
                  LUMI BOOK
                </div>
              )}
            </div>

            <div className="w-full text-center">
              <div className="text-[34px] font-semibold tracking-tightish text-ink-950">
                Привет, {master.name}
              </div>
              <div className="mt-2 text-[13px] font-medium tracking-tightish text-ink-700/65">
                Сегодня • {dateLabel}
              </div>
            </div>

            <div className="mt-4 flex w-full justify-end">
              <button
                type="button"
                onClick={() => nav('/calendar')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl border px-3 py-2',
                  'text-[12px] font-medium text-ink-800/80 shadow-soft',
                )}
                style={{
                  alignSelf: 'flex-end',
                  backdropFilter: glassBackdropFilter('interactive'),
                  backgroundColor: glassFill('interactive'),
                  borderColor: glassBorderStyle('interactive'),
                }}
              >
                <CalendarDays size={16} />
                Календарь
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
          <GlassCard className={cn(cardPad)} style={{ minHeight: 135 }}>
            <div className="text-[12px] font-medium text-ink-700/70">
              Записей сегодня
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tightish text-ink-950">
              {bookingsToday.length}
            </div>
            {cognitivePolicy.showAmbientHints ? (
              <div className="mt-1 text-[12px] text-ink-700/60">
                Всё под контролем
              </div>
            ) : (
              <div className="mt-1 text-[11px] text-ink-700/45">Лента дня</div>
            )}
          </GlassCard>

          <GlassCard className={cn(cardPad)} style={{ minHeight: 135 }}>
            <div className="text-[12px] font-medium text-ink-700/70">Доход</div>
            <div className="mt-2 text-[26px] font-semibold tracking-tightish text-ink-950">
              {money(income)} ₽
            </div>
            {cognitivePolicy.showAmbientHints ? (
              <div className="mt-1 text-[12px] text-ink-700/60">За день</div>
            ) : (
              <div className="mt-1 text-[11px] text-ink-700/45">Сводка</div>
            )}
          </GlassCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div style={{ minHeight: 190 }}>
            <FocusCard
              model={focus}
              compact={compact}
              onAction={(action) => {
                if (action.kind === 'open_calendar') nav('/calendar')
                if (action.kind === 'open_reschedule') {
                  nav(
                    `/reschedule?bookingId=${encodeURIComponent(action.bookingId)}&clientId=${encodeURIComponent(
                      action.clientId,
                    )}&serviceId=${encodeURIComponent(action.serviceId)}&masterId=${encodeURIComponent(
                      action.masterId,
                    )}&date=${encodeURIComponent(action.dateISO)}&time=${encodeURIComponent(action.time)}`,
                  )
                }
                if (action.kind === 'open_message') nav('/clients')
              }}
            />
          </div>

          <div style={{ minHeight: 92 }}>
            <MiniWidgets
              widgets={widgets}
              compact={compact || cognitivePolicy.miniWidgetsCompact}
              hideRecovery={cognitivePolicy.hideRecoveryWidget}
            />
          </div>

          <GlassCard
            onClick={() => nav('/calendar/new')}
            className={cn(cardPad)}
            style={{ minHeight: 150 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
                  {cognitivePolicy.showAmbientHints ? (
                    <Sparkles size={16} className="text-gold-400" />
                  ) : null}
                  Умная запись
                </div>
                <div className="mt-2 text-[16px] font-semibold tracking-tightish text-ink-950">
                  Создать запись в одно касание
                </div>
                {cognitivePolicy.showAmbientHints ? (
                  <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                    Вы выбираете дату — Lumi сама покажет окна → услуги → готово.
                  </div>
                ) : null}
              </div>
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 shadow-glowGold">
                <ArrowRight size={18} className="text-ink-950" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className={cn(cardPad)} style={{ minHeight: 135 }}>
            <div className="text-[12px] font-medium text-ink-700/70">
              Ближайшая запись
            </div>
            {nextBooking ? (
              <button
                type="button"
                onClick={() =>
                  nav(
                    `/reschedule?bookingId=${encodeURIComponent(
                      nextBooking.id,
                    )}&clientId=${encodeURIComponent(
                      nextBooking.clientId,
                    )}&serviceId=${encodeURIComponent(
                      nextBooking.serviceId,
                    )}&masterId=${encodeURIComponent(
                      nextBooking.masterId,
                    )}&date=${encodeURIComponent(
                      nextBooking.dateISO,
                    )}&time=${encodeURIComponent(nextBooking.time)}`,
                  )
                }
                className="mt-3 flex w-full items-center justify-between gap-3 rounded-3xl border border-white/0 bg-transparent p-0 text-left"
              >
                <div>
                  <div className="text-[16px] font-semibold text-ink-950">
                    {getClient(nextBooking.clientId)?.name ?? nextBooking.clientName ?? 'Клиент'}
                  </div>
                  <div className="mt-1 text-[12px] text-ink-700/65">
                    {nextBooking.time} •{' '}
                    {getService(nextBooking.serviceId)?.name ?? nextBooking.serviceName ?? 'Услуга'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/55 bg-white/55 px-3 py-2 text-[12px] font-medium text-ink-800/80 shadow-soft">
                  {getMaster(nextBooking.masterId)?.name ?? nextBooking.masterName ?? 'Мастер'}
                </div>
              </button>
            ) : (
              <div
                className={cn(
                  'mt-2 text-ink-700/65',
                  cognitivePolicy.showAmbientHints ? 'text-[13px]' : 'text-[12px]',
                )}
              >
                {cognitivePolicy.showAmbientHints
                  ? 'Сегодня спокойно — записей пока нет.'
                  : 'Записей на сегодня пока нет.'}
              </div>
            )}
          </GlassCard>

          <GlassCard className={cn(cardPad)} style={{ minHeight: 135 }}>
            <div className="text-[12px] font-medium text-ink-700/70">
              Свободные окна
            </div>
            <div
              className="mt-3 flex flex-wrap"
              style={{
                gap: 'calc(var(--cognitive-inline-stack) * 0.92 * (1 - var(--global-cognitive-load, 0) * 0.08))',
              }}
            >
              {slots.slice(0, cognitivePolicy.freeSlotChips).map((t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-[12px] font-medium text-ink-800/80 shadow-soft"
                >
                  {t}
                </div>
              ))}
              {slots.length === 0 ? (
                <div className="text-[13px] text-ink-700/65">Всё занято</div>
              ) : null}
            </div>
          </GlassCard>

          {homeMode === 'busy' ? (
            <>
              <div style={{ minHeight: 160 }}>
                <AssistantLayer compact={compact} />
              </div>
              <div style={{ minHeight: 160 }}>
                <SmartReminders hideWhenEmpty />
              </div>
              {cognitivePolicy.hideBusyHeavyBlocks ? null : (
                <>
                  <div style={{ minHeight: 160 }}>
                    <RecoveryDashboard />
                  </div>
                  <div style={{ minHeight: 210 }}>
                    <DayTimeline />
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ minHeight: 160 }}>
                <AssistantLayer compact={compact} />
              </div>
              <div style={{ minHeight: 160 }}>
                <SmartReminders hideWhenEmpty />
              </div>
            </>
          )}

          <div className="h-[120px]" />
        </div>
      </div>
    </div>
  )
}

