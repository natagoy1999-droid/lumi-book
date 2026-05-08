import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { useStore } from '../state/store'

export function Onboarding() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const [choice, setChoice] = useState<'lumi' | 'empty'>('lumi')
  const title = useMemo(() => (choice === 'lumi' ? 'Премиум демо-салон' : 'Пустой салон'), [choice])
  const [logoOk, setLogoOk] = useState(true)

  return (
    <div className="px-5 pt-10">
      <div className="mx-auto max-w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 44 }}
          className="mb-7"
        >
          <div className="mb-5">
            <div className="inline-flex items-center justify-center rounded-[28px] border border-white/55 bg-white/60 p-4 shadow-lift backdrop-blur-glass">
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
                <div className="px-3 py-2 text-[16px] font-semibold tracking-tightish text-ink-950">
                  LUMI BOOK
                </div>
              )}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-fog-200 px-3 py-1 text-[12px] font-medium text-ink-700/80 shadow-soft backdrop-blur-glass">
            <Sparkles size={16} className="text-gold-400" />
            Lumi Assistant • умная запись
          </div>

          <div className="mt-4 text-[34px] font-semibold tracking-tightish text-ink-950">
            LUMI BOOK
          </div>
          <div className="mt-2 text-[15px] leading-6 text-ink-700/70">
            Нажали — дальше всё само.
            <br />
            Спокойная запись, красивые окна, и мягкие напоминания клиентам.
          </div>
        </motion.div>

        <div className="space-y-3">
          <GlassCard className="p-5">
            <div className="text-[13px] font-medium text-ink-700/75">Демо окружение</div>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setChoice('lumi')}
                className="w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-left shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold tracking-tightish text-ink-950">
                      Премиум демо-салон
                    </div>
                    <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                      Реалистичные клиенты, история записей, переносы, ожидания подтверждений,
                      follow-ups, завтра занято, свободные “гепы”.
                    </div>
                  </div>
                  {choice === 'lumi' ? (
                    <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 shadow-soft ring-1 ring-gold-200/60">
                      <Check size={16} className="text-gold-400" />
                    </div>
                  ) : (
                    <div className="mt-1 h-9 w-9 rounded-2xl bg-white/55" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChoice('empty')}
                className="w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-left shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold tracking-tightish text-ink-950">
                      Пустой салон
                    </div>
                    <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                      Начать с нуля и создать первую запись вручную.
                    </div>
                  </div>
                  {choice === 'empty' ? (
                    <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 shadow-soft ring-1 ring-gold-200/60">
                      <Check size={16} className="text-gold-400" />
                    </div>
                  ) : (
                    <div className="mt-1 h-9 w-9 rounded-2xl bg-white/55" />
                  )}
                </div>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="text-[13px] font-medium text-ink-700/75">Первые 30 секунд</div>
            <div className="mt-3 space-y-2 text-[15px] text-ink-950">
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-300" />
                Откройте Today и нажмите на мягкий action в доке
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-300" />
                Посмотрите перенос — слоты уже готовы
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gold-300" />
                Откройте Composer: текст уже подготовлен (mock-send)
              </div>
            </div>
          </GlassCard>

          <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 600, damping: 40 }}
            onClick={() => {
              if (choice === 'lumi') dispatch({ type: 'seedDemoData' })
              if (choice === 'empty') dispatch({ type: 'resetAllData' })
              dispatch({ type: 'finishOnboarding' })
              nav('/today', { replace: true })
            }}
            className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold"
          >
            Начать • {title}
          </motion.button>

          <div className="px-1 text-center text-[12px] leading-5 text-ink-700/60">
            Можно в любой момент переключить демо в Настройках → Seed demo / Reset.
          </div>
        </div>
      </div>
    </div>
  )
}

