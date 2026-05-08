import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../lib/cn'
import { useDemoMode } from '../state/demoMode'

type StepModel = {
  idx: number
  total: number
  title: string
  subtitle: string
  cta: string
  route?: string
}

function useStepModel() {
  const step = useDemoMode((s) => s.step)
  return useMemo((): StepModel => {
    const order = [
      'intro',
      'create_booking',
      'reschedule',
      'smart_reminder',
      'assistant',
      'analytics',
      'followup',
      'done',
    ] as const
    const idxRaw = order.indexOf(step)
    const idx = idxRaw >= 0 ? idxRaw + 1 : 1
    const total = order.length

    switch (step) {
      case 'intro':
        return {
          idx,
          total,
          title: 'Demo • 60–90 секунд',
          subtitle:
            'Пройдём ключевые сценарии: запись → перенос → напоминание → ассистент → деньги → follow-up.',
          cta: 'Начать',
          route: '/today',
        }
      case 'create_booking':
        return {
          idx,
          total,
          title: '1) Создание записи',
          subtitle: 'Откройте онлайн-запись и выберите услугу → мастера → дату → время.',
          cta: 'Открыть онлайн-запись',
          route: '/client-booking',
        }
      case 'reschedule':
        return {
          idx,
          total,
          title: '2) Перенос',
          subtitle: 'Откройте перенос — слоты уже готовы. Отправьте предложение (mock-send).',
          cta: 'Открыть перенос',
          route: '/reschedule?bookingId=b_t_3&clientId=c4&serviceId=s5&masterId=m1',
        }
      case 'smart_reminder':
        return {
          idx,
          total,
          title: '3) Напоминание клиенту',
          subtitle: 'В Today — мягкие напоминания. Нажмите действие → Composer.',
          cta: 'Открыть Today',
          route: '/today',
        }
      case 'assistant':
        return {
          idx,
          total,
          title: '4) Lumi Assistant',
          subtitle: 'Ассистент предлагает спокойные варианты и помогает держать ритм дня.',
          cta: 'Показать Today',
          route: '/today',
        }
      case 'analytics':
        return {
          idx,
          total,
          title: '5) Деньги',
          subtitle: 'Аналитика считается из реальных записей: день / неделя / месяц / средний чек.',
          cta: 'Открыть “Деньги”',
          route: '/money',
        }
      case 'followup':
        return {
          idx,
          total,
          title: '6) Follow-up',
          subtitle: 'Откройте Clients и нажмите на клиента — можно мягко подготовить контакт.',
          cta: 'Открыть “Клиенты”',
          route: '/clients',
        }
      case 'done':
        return {
          idx,
          total,
          title: 'Готово',
          subtitle: 'Это базовый demo loop. Можно повторить или продолжить работать в Today.',
          cta: 'В Today',
          route: '/today',
        }
    }
  }, [step])
}

export function DemoWalkthrough() {
  const nav = useNavigate()
  const active = useDemoMode((s) => s.active)
  const prev = useDemoMode((s) => s.prev)
  const next = useDemoMode((s) => s.next)
  const stop = useDemoMode((s) => s.stop)
  const step = useDemoMode((s) => s.step)
  const model = useStepModel()

  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    if (!model?.title || !model?.cta) {
      stop()
      nav('/settings')
    }
  }, [active, model?.cta, model?.title, nav, stop])

  return (
    <AnimatePresence>
      {active ? (
        <>
          <motion.button
            aria-label="Close"
            className="fixed inset-0 z-[100] cursor-default"
            style={{
              backgroundColor: 'rgba(14, 16, 22, 0.30)',
              backdropFilter: 'blur(6px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => stop()}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed bottom-0 left-0 right-0 z-[120] mx-auto max-w-[520px]"
            style={{
              width: 'calc(100% - 32px)',
              paddingBottom: 'calc(14px + var(--safe-bottom))',
            }}
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 26, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 44, mass: 0.9 }}
          >
            <div
              className={cn(
                'rounded-[30px] border border-white/60 p-5 shadow-lift',
                'ring-1 ring-black/5',
              )}
              style={{
                backgroundColor: 'rgba(255, 253, 248, 0.92)',
                backdropFilter: 'blur(18px)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[12px] font-medium text-ink-700/70">
                    Guided demo • шаг {model.idx}/{model.total}
                  </div>
                  <div className="mt-1 text-[16px] font-semibold tracking-tightish text-ink-950">
                    {model.title}
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                    {model.subtitle}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => stop()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/60 text-ink-950 shadow-soft"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => prev()}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/60 bg-white/60 px-4 py-4 text-[13px] font-semibold text-ink-950 shadow-soft"
                >
                  <ArrowLeft size={16} />
                  Назад
                </button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                  onClick={() => {
                    if (model.route) nav(model.route)
                    next()
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-ink-950 px-4 py-4 text-[13px] font-semibold text-paper-50 shadow-glowGold"
                >
                  {step === 'intro' ? <Play size={18} /> : <ArrowRight size={18} />}
                  {model.cta}
                </motion.button>

                <button
                  type="button"
                  onClick={() => stop()}
                  className="rounded-3xl border border-white/60 bg-white/60 px-4 py-4 text-[13px] font-semibold text-ink-950 shadow-soft"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

