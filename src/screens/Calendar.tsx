import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
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

  const chipGap = 'calc(0.5rem * var(--global-rhythm, 1))'

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
          className="mb-4"
        >
          <div className="lumi-page-title">Календарь</div>
        </motion.div>

        <div className="flex flex-col pb-2" style={{ gap: chipGap }}>
          <div className="flex items-center justify-between" style={{ gap: chipGap }}>
            <button
              type="button"
              aria-label="Предыдущий месяц"
              onClick={goPrevMonth}
              className={cn(
                'inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-3xl border-[1.5px] px-2 shadow-soft transition',
                'border-gold-400/22 bg-white/55 hover:border-gold-400/40 hover:bg-[var(--lumi-surface)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
              )}
            >
              <ChevronLeft size={20} className="text-ink-800/75" strokeWidth={2} />
            </button>
            <div className="min-w-0 flex-1 text-center text-[14px] font-semibold tracking-tightish text-ink-950">
              {monthTitle}
            </div>
            <button
              type="button"
              aria-label="Следующий месяц"
              onClick={goNextMonth}
              className={cn(
                'inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-3xl border-[1.5px] px-2 shadow-soft transition',
                'border-gold-400/22 bg-white/55 hover:border-gold-400/40 hover:bg-[var(--lumi-surface)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
              )}
            >
              <ChevronRight size={20} className="text-ink-800/75" strokeWidth={2} />
            </button>
          </div>

          <div
            className="grid grid-cols-7 text-center"
            style={{ gap: chipGap }}
            role="grid"
            aria-label="Календарь"
          >
            {WEEKDAYS_MON_FIRST.map((w) => (
              <div
                key={w}
                className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-700/60"
              >
                {w}
              </div>
            ))}
            {cells.map((day, idx) => {
              if (day == null) {
                return <div key={`pad-${idx}`} className="min-h-[44px]" aria-hidden />
              }
              const iso = toISO(viewY, viewM, day)
              const active = iso === dateISO
              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  aria-pressed={active}
                  onClick={() => setDateISO(iso)}
                  className={cn(
                    'flex min-h-[44px] touch-manipulation flex-col items-center justify-center rounded-3xl border-[1.5px] px-1 py-2 shadow-soft transition',
                    active
                      ? 'border-gold-400 bg-[var(--lumi-surface)] shadow-glowGold'
                      : 'border-gold-400/22 bg-white/55 hover:border-gold-400/40 hover:bg-[var(--lumi-surface)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
                  )}
                >
                  <span className="text-[18px] font-semibold tracking-tightish text-ink-950">
                    {day}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-col" style={{ gap: 'var(--cognitive-inline-stack)' }}>
          {showAmbientHints ? (
            <GlassCard className="p-5">
              <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
                <Sparkles size={16} className="text-gold-400" />
                Выберите дату — и Lumi сама откроет окна времени
              </div>
            </GlassCard>
          ) : null}

          <GlassCard className="p-5">
            <div className="text-[12px] font-medium text-ink-700/70">
              Расписание на {dateISO}
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
                    className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft"
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
              <div className="mt-4 rounded-3xl border border-white/55 bg-white/45 px-4 py-4 text-[13px] leading-relaxed text-ink-700/70 shadow-soft">
                <div className="font-semibold tracking-tight text-ink-950">Свободный день</div>
                <div className="mt-1 text-[13px] leading-relaxed text-ink-700/65">
                  Записей на эту дату пока нет — можно добавить или оставить окна свободными.
                </div>
              </div>
            )}

            <div className="mt-5">
              <LumiButton
                type="button"
                onClick={() =>
                  nav(`/calendar/new?date=${encodeURIComponent(dateISO)}`)
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
