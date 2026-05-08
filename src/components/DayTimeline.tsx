import { motion } from 'framer-motion'
import { CalendarDays, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../lib/cn'
import { computeDayGaps } from '../lib/assistantEngine'
import { todayISO, useStore } from '../state/store'
import { GlassCard } from './GlassCard'

function minutesOf(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

export function DayTimeline() {
  const { state, getClient, getService } = useStore()
  const master = state.masters[0]
  const day = todayISO()

  const bookings = useMemo(() => {
    return state.bookings
      .filter((b) => b.masterId === master.id && b.dateISO === day && b.status !== 'cancelled')
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [day, master.id, state.bookings])

  const gaps = useMemo(
    () => computeDayGaps({ bookings: state.bookings, masterId: master.id, dateISO: day }),
    [day, master.id, state.bookings],
  )

  const workStart = minutesOf('10:00')
  const workEnd = minutesOf('20:00')
  const span = Math.max(1, workEnd - workStart)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
          <CalendarDays size={16} className="text-gold-400" />
          Таймлайн дня
        </div>
        <div className="inline-flex items-center gap-2 text-[12px] text-ink-700/55">
          <Sparkles size={14} className="text-ink-700/55" />
          ритм + окна
        </div>
      </div>

      <div className="mt-4">
        <div className="relative h-24 overflow-hidden rounded-[26px] border border-white/55 bg-white/45 shadow-soft">
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0.78 }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(80% 120% at 20% 30%, rgba(241,215,138,0.22), transparent 60%), radial-gradient(80% 120% at 80% 70%, rgba(214,178,94,0.16), transparent 62%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/28 to-transparent" />

          {gaps.slice(0, 2).map((g) => {
            const start = minutesOf(g.start)
            const end = minutesOf(g.end)
            const left = clamp(((start - workStart) / span) * 100, 0, 100)
            const right = clamp(((end - workStart) / span) * 100, 0, 100)
            const width = Math.max(6, right - left)
            return (
              <motion.div
                key={`${g.start}-${g.end}`}
                className="absolute top-8 h-8 rounded-3xl border border-white/40 bg-white/20"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 44 }}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            )
          })}

          {bookings.map((b) => {
            const start = minutesOf(b.time)
            const left = clamp(((start - workStart) / span) * 100, 0, 100)
            const width = 10 // visual “chunk”
            return (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 44 }}
                className={cn(
                  'absolute top-4 h-16 rounded-3xl border border-white/60 bg-ink-950/90 shadow-glowGold',
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <div className="px-3 py-2">
                  <div className="text-[11px] font-semibold text-paper-50">{b.time}</div>
                  <div className="mt-0.5 truncate text-[11px] text-paper-50/80">
                    {getClient(b.clientId)?.name ?? 'Клиент'}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
              Записей
            </div>
            <div className="mt-1 text-[16px] font-semibold tracking-tightish text-ink-950">
              {bookings.length}
            </div>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
              Лучший gap
            </div>
            <div className="mt-1 text-[16px] font-semibold tracking-tightish text-ink-950">
              {gaps[0] ? `${gaps[0].start}–${gaps[0].end}` : '—'}
            </div>
          </div>
        </div>

        {bookings[0] ? (
          <div className="mt-3 rounded-3xl border border-white/60 bg-white/50 px-4 py-3 text-[12px] leading-5 text-ink-700/70 shadow-soft">
            Сегодня: {getService(bookings[0].serviceId)?.name ?? 'услуга'} • первый клиент в{' '}
            <span className="font-semibold text-ink-950">{bookings[0].time}</span>
          </div>
        ) : (
          <div className="mt-3 rounded-3xl border border-white/60 bg-white/50 px-4 py-3 text-[12px] leading-5 text-ink-700/70 shadow-soft">
            Сегодня свободно и спокойно. Lumi может предложить премиальные окна вашим клиентам.
          </div>
        )}
      </div>
    </GlassCard>
  )
}

