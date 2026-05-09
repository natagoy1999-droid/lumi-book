import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { ROUTE_APP_TODAY } from '../lib/appRoutes'
import { cn } from '../lib/cn'
import { lumiPrimaryActionMd } from '../lib/lumiActionStyles'
import { motion as motionTokens } from '../theme/motion'
import { useStore } from '../state/store'
import { useAuthStore } from '../store/authStore'

export function Onboarding() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const [logoOk, setLogoOk] = useState(true)
  const mode = useAuthStore((s) => s.mode)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (mode === 'auth') {
      dispatch({ type: 'finishOnboarding' })
      nav(ROUTE_APP_TODAY, { replace: true })
    }
  }, [dispatch, mode, nav])

  const slides = useMemo(
    () => [
      {
        title: 'LUMI BOOK',
        text: 'Запись для мастеров и клиентов — без суеты и лишних экранов.',
      },
      {
        title: 'В одном ритме',
        text: 'Клиенты, напоминания и расписание собираются вместе, чтобы день оставался вашим.',
      },
      {
        title: 'Без хаоса',
        text: 'Меньше переключений — больше внимания к людям и деталям.',
      },
    ],
    [],
  )
  const s = slides[Math.max(0, Math.min(slides.length - 1, step))]

  return (
    <div
      className="px-5"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 2.25rem)',
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
      }}
    >
      <div className="mx-auto max-w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.out,
          }}
          className="mb-10"
        >
          <div className="mb-7 flex justify-center">
            <div className="inline-flex items-center justify-center rounded-[28px] border border-white/55 bg-white/58 px-5 py-5 shadow-lift backdrop-blur-glass">
              {logoOk ? (
                <img
                  src="/lumi-logo-transparent.png"
                  alt="LUMI BOOK"
                  className="h-auto object-contain"
                  style={{ width: 172, maxWidth: '68vw' }}
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

          <div className="relative min-h-[7.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: motionTokens.duration.slow,
                  ease: motionTokens.ease.calm,
                }}
              >
                <h1 className="text-[32px] font-semibold leading-[1.12] tracking-tightish text-ink-950">
                  {s.title}
                </h1>
                <p className="mt-4 max-w-[400px] text-[16px] leading-[1.6] text-ink-900/68">{s.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12px] font-medium tracking-tightish text-ink-700/65">
                {step + 1} из {slides.length}
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'finishOnboarding' })
                  nav('/auth', { replace: true })
                }}
                className="touch-manipulation rounded-2xl border border-white/55 bg-white/52 px-4 py-2.5 text-[12px] font-semibold text-ink-800/90 shadow-soft transition-colors duration-200 hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF] active:opacity-[var(--press-opacity,0.94)] active:scale-[var(--press-scale,0.992)]"
              >
                Пропустить
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep((x) => Math.max(0, x - 1))}
                  disabled={step === 0}
                  className="touch-manipulation min-h-[52px] flex-1 lumi-card px-4 py-3.5 text-[14px] font-semibold text-ink-950 transition-colors duration-200 hover:bg-white/68 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF] active:scale-[var(--press-scale,0.992)]"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (step < slides.length - 1) setStep((x) => x + 1)
                    else {
                      dispatch({ type: 'finishOnboarding' })
                      nav('/auth', { replace: true })
                    }
                  }}
                  className={cn(
                    'touch-manipulation inline-flex min-h-[52px] flex-[1.35] items-center justify-center gap-2 active:scale-[var(--press-scale,0.992)]',
                    lumiPrimaryActionMd,
                  )}
                >
                  {step < slides.length - 1 ? 'Далее' : 'Начать'}
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => nav('/book')}
                className="touch-manipulation min-h-[48px] w-full lumi-card bg-white/52 py-3 text-[14px] font-semibold text-ink-900/85 transition-colors duration-200 hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF] active:scale-[var(--press-scale,0.992)]"
              >
                Я клиент — онлайн-запись
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
