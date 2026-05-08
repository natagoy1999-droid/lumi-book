import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

import { GlassCard } from '../components/GlassCard'
import { useCognitiveUI } from '../state/cognitiveUI'
import { todayISO, useStore } from '../state/store'

function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n)
}

function startOfWeekISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const day = dt.getDay() // 0..6, Sunday=0
  const shift = (day + 6) % 7 // Monday=0
  dt.setDate(dt.getDate() - shift)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
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

export function Money() {
  const analyticsCap = useCognitiveUI((s) => s.policy.analyticsServiceRowsCap)
  const showAmbientHints = useCognitiveUI((s) => s.policy.showAmbientHints)
  const { state, moneyForDay } = useStore()
  const today = todayISO()

  const day = moneyForDay(today)
  const week = useMemo(() => {
    const start = startOfWeekISO(today)
    const days = Array.from({ length: 7 }, (_, i) => addDaysISO(start, i))
    return days.reduce((sum, d) => sum + moneyForDay(d), 0)
  }, [moneyForDay, today])
  const month = useMemo(() => {
    const [y, m] = today.split('-').map(Number)
    const prefix = `${y}-${String(m).padStart(2, '0')}-`
    return state.bookings
      .filter((b) => b.dateISO.startsWith(prefix) && b.status !== 'draft' && b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.price || 0), 0)
  }, [state.bookings, today])
  const avg = useMemo(() => {
    const done = state.bookings.filter((b) => b.status !== 'draft' && b.status !== 'cancelled')
    const total = done.reduce((sum, b) => sum + (b.price || 0), 0)
    return done.length ? total / done.length : 0
  }, [state.bookings])

  const top = useMemo(
    () => {
      const counts = new Map<string, { count: number; sum: number }>()
      for (const b of state.bookings) {
        if (b.status === 'draft' || b.status === 'cancelled') continue
        const cur = counts.get(b.serviceId) ?? { count: 0, sum: 0 }
        cur.count += 1
        cur.sum += b.price || 0
        counts.set(b.serviceId, cur)
      }

      return state.services
        .map((s) => {
          const c = counts.get(s.id) ?? { count: 0, sum: 0 }
          return { ...s, count: c.count, revenue: c.sum }
        })
        .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
        .slice(0, analyticsCap)
    },
    [analyticsCap, state.bookings, state.services],
  )

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
          <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">
            Деньги
          </div>
          <div className="mt-1 text-[28px] font-semibold tracking-tightish text-ink-950">
            Спокойная аналитика
          </div>
        </motion.div>

        <div className="grid grid-cols-2" style={{ gap: 'var(--cognitive-grid-gap)' }}>
          <GlassCard className="p-5">
            <div className="text-[12px] font-medium text-ink-700/70">Сегодня</div>
            <div className="mt-2 text-[26px] font-semibold tracking-tightish text-ink-950">
              {money(day)} ₽
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-gold-400">
              <ArrowUpRight size={14} />
              мягкий рост
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="text-[12px] font-medium text-ink-700/70">Средний чек</div>
            <div className="mt-2 text-[26px] font-semibold tracking-tightish text-ink-950">
              {money(Math.round(avg))} ₽
            </div>
            <div className="mt-1 text-[12px] text-ink-700/60">В среднем</div>
          </GlassCard>
        </div>

        <div className="mt-3 grid grid-cols-2" style={{ gap: 'var(--cognitive-grid-gap)' }}>
          <GlassCard className="p-5">
            <div className="text-[12px] font-medium text-ink-700/70">Неделя</div>
            <div className="mt-2 text-[22px] font-semibold tracking-tightish text-ink-950">
              {money(week)} ₽
            </div>
            <div className="mt-1 text-[12px] text-ink-700/60">Прогноз</div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="text-[12px] font-medium text-ink-700/70">Месяц</div>
            <div className="mt-2 text-[22px] font-semibold tracking-tightish text-ink-950">
              {money(month)} ₽
            </div>
            <div className="mt-1 text-[12px] text-ink-700/60">Прогноз</div>
          </GlassCard>
        </div>

        <div className="mt-3 flex flex-col" style={{ gap: 'var(--cognitive-inline-stack)' }}>
          <GlassCard className="p-5">
            <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
              {showAmbientHints ? <Sparkles size={16} className="text-gold-400" /> : null}
              Популярные услуги
            </div>
            <div
              className="mt-4 flex flex-col"
              style={{
                gap: 'calc(0.5rem * var(--global-rhythm, 1) * (1 - var(--global-cognitive-load, 0) * 0.05))',
              }}
            >
              {top.map((s) => (
                <div
                  key={s.id}
                  className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                      {s.name}
                    </div>
                    <div className="text-[12px] font-medium text-ink-700/65">
                      {money(s.price)} ₽
                    </div>
                  </div>
                  <div className="mt-1 text-[12px] text-ink-700/60">{s.minutes} мин</div>
                  <div className="mt-1 text-[12px] text-ink-700/55">
                    Записей: {('count' in s ? s.count : 0)}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

