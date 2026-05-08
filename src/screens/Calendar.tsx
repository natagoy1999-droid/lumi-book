import { motion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { cn } from '../lib/cn'
import { useCognitiveUI } from '../state/cognitiveUI'
import { todayISO, useStore } from '../state/store'

function addDaysISO(iso: string, delta: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function weekdayShort(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('ru-RU', { weekday: 'short' })
}

function dayNum(iso: string) {
  return iso.split('-')[2]
}

export function Calendar() {
  const nav = useNavigate()
  const showAmbientHints = useCognitiveUI((s) => s.policy.showAmbientHints)
  const { state, getClient, getService } = useStore()
  const [dateISO, setDateISO] = useState(todayISO())
  const master = state.masters[0]

  const days = useMemo(
    () => Array.from({ length: 10 }, (_, i) => addDaysISO(todayISO(), i)),
    [],
  )

  const bookings = state.bookings
    .filter((b) => b.dateISO === dateISO && b.masterId === master.id)
    .sort((a, b) => a.time.localeCompare(b.time))

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
          className="mb-4 flex items-end justify-between"
        >
          <div>
            <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">
              Календарь
            </div>
            <div className="mt-1 text-[28px] font-semibold tracking-tightish text-ink-950">
              {master.name}
            </div>
          </div>

          <button
            type="button"
            onClick={() => nav('/calendar/new')}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink-950 px-4 py-3 text-[13px] font-medium text-paper-50 shadow-glowGold"
          >
            <Plus size={18} />
            Запись
          </button>
        </motion.div>

        <div
          className="flex overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
          style={{ gap: 'calc(0.5rem * var(--global-rhythm, 1))' }}
        >
          {days.map((d) => {
            const active = d === dateISO
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDateISO(d)
                  nav(`/calendar/new?date=${encodeURIComponent(d)}`, { replace: true })
                }}
                className={cn(
                  'min-w-[64px] rounded-3xl border px-3 py-3 text-left shadow-soft transition',
                  'backdrop-blur-glass',
                  active
                    ? 'border-white/60 bg-white/65'
                    : 'border-white/45 bg-fog-200 hover:bg-white/55',
                )}
              >
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-700/60">
                  {weekdayShort(d)}
                </div>
                <div className="mt-1 text-[18px] font-semibold tracking-tightish text-ink-950">
                  {dayNum(d)}
                </div>
              </button>
            )
          })}
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
                        {b.time} • {getClient(b.clientId)?.name ?? 'Клиент'}
                      </div>
                      <div className="text-[12px] font-medium text-ink-700/65">
                        {b.price} ₽
                      </div>
                    </div>
                    <div className="mt-1 text-[12px] text-ink-700/60">
                      {getService(b.serviceId)?.name ?? 'Услуга'}
                      {b.status === 'pending_confirm' ? (
                        <span className="ml-2 inline-flex items-center rounded-full border border-gold-200/60 bg-white/55 px-2 py-0.5 text-[11px] font-medium text-ink-800/70">
                          pending
                        </span>
                      ) : null}
                      {b.status === 'reschedule_pending' ? (
                        <span className="ml-2 inline-flex items-center rounded-full border border-gold-200/60 bg-white/55 px-2 py-0.5 text-[11px] font-medium text-ink-800/70">
                          reschedule
                        </span>
                      ) : null}
                      {b.status === 'cancelled' ? (
                        <span className="ml-2 inline-flex items-center rounded-full border border-white/60 bg-white/45 px-2 py-0.5 text-[11px] font-medium text-ink-700/60">
                          cancelled
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-[13px] text-ink-700/65">
                На этот день пока тишина. Хотите — Lumi предложит клиентам свободные окна.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

