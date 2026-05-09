import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { ROUTE_APP_CALENDAR_NEW } from '../lib/appRoutes'
import { cn } from '../lib/cn'
import { LumiButton } from '../components/ui/LumiButton'
import { useCognitiveUI } from '../state/cognitiveUI'
import { todayISO, useStore } from '../state/store'

const WEEKDAYS_MON_FIRST = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

function parseParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m: m - 1, d }
}

function toISO(y: number, monthIndex: number, day: number) {
  return `${y}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function monthGridCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const mondayOffset = (first.getDay() + 6) % 7
  const list: (number | null)[] = []
  for (let i = 0; i < mondayOffset; i++) list.push(null)
  for (let day = 1; day <= daysInMonth; day++) list.push(day)
  while (list.length % 7 !== 0) list.push(null)
  return list
}

export function Calendar() {
  const nav = useNavigate()
  const showAmbientHints = useCognitiveUI((s) => s.policy.showAmbientHints)
  const { state, getClient, getService } = useStore()
  const [dateISO, setDateISO] = useState(todayISO())
  const master = state.masters[0]

  const [viewY, setViewY] = useState(() => parseParts(todayISO()).y)
  const [viewM, setViewM] = useState(() => parseParts(todayISO()).m)

  useEffect(() => {
    const { y, m } = parseParts(dateISO)
    setViewY(y)
    setViewM(m)
  }, [dateISO])

  const monthTitle = useMemo(() => {
    const raw = new Date(viewY, viewM, 1).toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }, [viewY, viewM])

  const cells = useMemo(() => monthGridCells(viewY, viewM), [viewY, viewM])

  /** Дни месяца с хотя бы одной записью (для точки-индикатора). */
  const bookingDatesInMonth = useMemo(() => {
    const set = new Set<string>()
    for (const b of state.bookings) {
      if (b.masterId !== master.id) continue
      if (b.status === 'cancelled') continue
      const [y, m] = b.dateISO.split('-').map(Number)
      if (y === viewY && m - 1 === viewM) set.add(b.dateISO)
    }
    return set
  }, [state.bookings, master.id, viewY, viewM])

  const todayStr = todayISO()

  const goPrevMonth = () => {
    if (viewM === 0) {
      setViewY((yy) => yy - 1)
      setViewM(11)
    } else {
      setViewM((mm) => mm - 1)
    }
  }

  const goNextMonth = () => {
    if (viewM === 11) {
      setViewY((yy) => yy + 1)
      setViewM(0)
    } else {
      setViewM((mm) => mm + 1)
    }
  }

  const bookings = state.bookings
    .filter((b) => b.dateISO === dateISO && b.masterId === master.id)
    .sort((a, b) => a.time.localeCompare(b.time))

  const gridGap = 'clamp(0.55rem, 2.2vw, 0.78rem)'

  return (
    <div
      className="px-5"
      style={{
        paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))',
      }}
    >
      <div className="mx-auto max-w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 44 }}
          className="mb-6"
        >
          <div className="lumi-page-title">Календарь</div>
        </motion.div>

        <GlassCard
          materialTier="interactive"
          className={cn(
            'border-[0.5px] border-gold-400/14 shadow-[0_20px_56px_-30px_rgba(45,35,20,0.14)] ring-1 ring-gold-400/[0.07]',
            'rounded-[24px] p-6 sm:p-7 sm:rounded-[28px]',
          )}
        >
          <div className="flex items-center justify-between gap-3 pb-8 pt-0.5">
            <button
              type="button"
              aria-label="Предыдущий месяц"
              onClick={goPrevMonth}
              className={cn(
                'inline-flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-[11px] border-[0.5px] transition duration-200',
                'border-gold-400/14 bg-[color-mix(in_srgb,var(--lumi-surface)_94%,transparent)] text-ink-800/55',
                'hover:border-gold-400/24 hover:bg-[var(--lumi-surface)] hover:text-ink-950',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/28 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
              )}
            >
              <ChevronLeft size={16} strokeWidth={1.65} />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <div className="text-[1.38rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink-950 sm:text-[1.48rem]">
                {monthTitle}
              </div>
            </div>
            <button
              type="button"
              aria-label="Следующий месяц"
              onClick={goNextMonth}
              className={cn(
                'inline-flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-[11px] border-[0.5px] transition duration-200',
                'border-gold-400/14 bg-[color-mix(in_srgb,var(--lumi-surface)_94%,transparent)] text-ink-800/55',
                'hover:border-gold-400/24 hover:bg-[var(--lumi-surface)] hover:text-ink-950',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/28 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
              )}
            >
              <ChevronRight size={16} strokeWidth={1.65} />
            </button>
          </div>

          <div
            className="grid grid-cols-7 text-center"
            style={{ gap: gridGap }}
            role="grid"
            aria-label="Календарь"
          >
            {WEEKDAYS_MON_FIRST.map((w) => (
              <div
                key={w}
                className="pb-2.5 text-[8.5px] font-normal uppercase tracking-[0.18em] text-ink-700/28 sm:text-[9.5px]"
              >
                {w}
              </div>
            ))}
            {cells.map((day, idx) => {
              if (day == null) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className="aspect-square min-h-[3rem] opacity-0"
                    aria-hidden
                  />
                )
              }
              const iso = toISO(viewY, viewM, day)
              const active = iso === dateISO
              const isTodayCell = iso === todayStr
              const hasBookings = bookingDatesInMonth.has(iso)
              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  aria-pressed={active}
                  aria-current={isTodayCell ? 'date' : undefined}
                  onClick={() => setDateISO(iso)}
                  className={cn(
                    'relative flex aspect-square min-h-[3rem] touch-manipulation flex-col items-center justify-center rounded-[14px] border-[0.5px] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
                    active
                      ? cn(
                          'border-gold-500/40 bg-gradient-to-b from-[var(--lumi-gold-cta-top)] to-[var(--lumi-gold-mid)] shadow-[0_12px_40px_-16px_rgba(198,161,91,0.48)]',
                          'active:scale-[0.98]',
                          isTodayCell &&
                            'ring-2 ring-gold-400/35 ring-offset-2 ring-offset-[color-mix(in_srgb,var(--lumi-gold-mid)_22%,var(--lumi-surface))]',
                        )
                      : cn(
                          'border-gold-400/[0.09] bg-[var(--lumi-surface)] shadow-none',
                          'hover:border-gold-400/18 hover:bg-[color-mix(in_srgb,var(--lumi-surface)_86%,var(--lumi-gold-soft)_14%)]',
                          isTodayCell &&
                            'border-gold-400/48 ring-2 ring-gold-400/22 ring-offset-2 ring-offset-[var(--lumi-surface)] shadow-[0_14px_42px_-18px_rgba(198,161,91,0.32)]',
                        ),
                  )}
                >
                  <span
                    className={cn(
                      'text-[15px] font-semibold tabular-nums tracking-[-0.02em] sm:text-[16px]',
                      active ? 'text-ink-950' : 'text-ink-950/[0.88]',
                    )}
                  >
                    {day}
                  </span>
                  {hasBookings ? (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute bottom-[6px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full',
                        active ? 'bg-ink-950/35' : 'bg-gold-400',
                        active ? 'ring-1 ring-ink-950/10' : 'opacity-[0.92]',
                      )}
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        </GlassCard>

        <div
          className="mt-11 flex flex-col border-t border-gold-400/[0.06] pt-9"
          style={{ gap: 'var(--cognitive-inline-stack)' }}
        >
          {showAmbientHints ? (
            <GlassCard
              materialTier="ambient"
              className={cn(
                'border-[0.5px] border-gold-400/[0.09] bg-[color-mix(in_srgb,var(--lumi-bg)_55%,var(--lumi-surface)_45%)] p-4 shadow-[0_6px_32px_-20px_rgba(45,35,20,0.06)] ring-1 ring-gold-400/[0.04]',
                'rounded-[18px]',
              )}
            >
              <div className="inline-flex items-center gap-2.5 text-[12px] font-medium leading-snug text-ink-700/62">
                <Sparkles size={15} className="shrink-0 text-gold-400/90" strokeWidth={1.75} />
                Выберите дату — и Lumi сама откроет окна времени
              </div>
            </GlassCard>
          ) : null}

          <GlassCard
            materialTier="ambient"
            className={cn(
              'border-[0.5px] border-gold-400/[0.09] bg-[color-mix(in_srgb,var(--lumi-surface)_70%,var(--lumi-bg)_30%)] p-5 shadow-[0_10px_40px_-24px_rgba(45,35,20,0.08)] ring-1 ring-gold-400/[0.04]',
              'rounded-[20px]',
            )}
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-700/40">
              Расписание
            </div>
            <div className="mt-1.5 tabular-nums text-[14px] font-semibold tracking-tight text-ink-950">
              {dateISO}
            </div>
            {bookings.length ? (
              <div
                className="mt-4 flex flex-col"
                style={{
                  gap: 'calc(0.5rem * var(--global-rhythm, 1) * (1 - var(--global-cognitive-load, 0) * 0.06))',
                }}
              >
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-[14px] border-[0.5px] border-gold-400/[0.08] bg-[color-mix(in_srgb,var(--lumi-surface)_82%,white)] px-4 py-3.5 shadow-[0_2px_20px_-12px_rgba(45,35,20,0.05)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                        {b.time} • {getClient(b.clientId)?.name ?? b.clientName ?? 'Клиент'}
                      </div>
                      <div className="text-[12px] font-medium text-ink-700/65">
                        {b.price} ₽
                      </div>
                    </div>
                    <div className="mt-1 text-[12px] text-ink-700/60">
                      {getService(b.serviceId)?.name ?? b.serviceName ?? 'Услуга'}
                      {b.status === 'pending_confirm' ? (
                        <span className="ml-2 inline-flex items-center rounded-full border border-gold-200/60 bg-white/55 px-2 py-0.5 text-[11px] font-medium text-ink-800/70">
                          ждём подтверждение
                        </span>
                      ) : null}
                      {b.status === 'reschedule_pending' ? (
                        <span className="ml-2 inline-flex items-center rounded-full border border-gold-200/60 bg-white/55 px-2 py-0.5 text-[11px] font-medium text-ink-800/70">
                          перенос
                        </span>
                      ) : null}
                      {b.status === 'cancelled' ? (
                        <span className="ml-2 inline-flex items-center rounded-full border border-white/60 bg-white/45 px-2 py-0.5 text-[11px] font-medium text-ink-700/60">
                          отменено
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[14px] border-[0.5px] border-gold-400/[0.07] bg-[color-mix(in_srgb,var(--lumi-surface)_88%,var(--lumi-bg)_12%)] px-4 py-4 text-[13px] leading-relaxed text-ink-700/65 shadow-[inset_0_1px_0_rgba(255,253,248,0.5)]">
                <div className="font-semibold tracking-tight text-ink-950">Свободный день</div>
                <div className="mt-1 text-[13px] leading-relaxed text-ink-700/62">
                  Записей на эту дату пока нет — можно добавить или оставить окна свободными.
                </div>
              </div>
            )}

            <div className="mt-6">
              <LumiButton
                type="button"
                onClick={() =>
                  nav(`${ROUTE_APP_CALENDAR_NEW}?date=${encodeURIComponent(dateISO)}`)
                }
              >
                Создать запись
              </LumiButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
