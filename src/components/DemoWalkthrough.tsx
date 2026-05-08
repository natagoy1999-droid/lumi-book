import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Play, X } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../lib/cn'
import { useDemoMode } from '../state/demoMode'

type StepModel = {
  title: string
  subtitle: string
  cta: string
  route?: string
}

function useStepModel() {
  const step = useDemoMode((s) => s.step)
  return useMemo((): StepModel => {
    switch (step) {
      case 'intro':
        return {
          title: 'Demo • 60–90 секунд',
          subtitle:
            'Пройдём ключевые сценарии: запись → перенос → напоминание → ассистент → деньги → follow-up.',
          cta: 'Начать',
          route: '/today',
        }
      case 'create_booking':
        return {
          title: '1) Создать запись',
          subtitle: 'Откройте календарь и создайте запись без кнопок “далее”.',
          cta: 'Открыть “Новая запись”',
          route: '/calendar/new',
        }
      case 'reschedule':
        return {
          title: '2) Перенос',
          subtitle: 'Откройте перенос — слоты уже готовы. Отправьте предложение (mock-send).',
          cta: 'Открыть перенос',
          route: '/reschedule?bookingId=b_t_3&clientId=c4&serviceId=s5&masterId=m1',
        }
      case 'smart_reminder':
        return {
          title: '3) Smart reminder',
          subtitle: 'В Today — мягкие напоминания без давления. Нажмите на действие → Composer.',
          cta: 'Вернуться в Today',
          route: '/today',
        }
      case 'assistant':
        return {
          title: '4) Assistant',
          subtitle: 'Ассистент предлагает спокойные варианты, когда день плотный или есть gap.',
          cta: 'Показать Today',
          route: '/today',
        }
      case 'analytics':
        return {
          title: '5) Деньги',
          subtitle: 'Аналитика считается из реальных записей: день / неделя / месяц / средний чек.',
          cta: 'Открыть “Деньги”',
          route: '/money',
        }
      case 'followup':
        return {
          title: '6) Follow-up',
          subtitle: 'Откройте Clients и нажмите на клиента — можно мягко подготовить контакт.',
          cta: 'Открыть “Клиенты”',
          route: '/clients',
        }
      case 'done':
        return {
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
  const next = useDemoMode((s) => s.next)
  const stop = useDemoMode((s) => s.stop)
  const step = useDemoMode((s) => s.step)
  const model = useStepModel()

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="fixed inset-x-0 bottom-[calc(78px+var(--safe-bottom))] z-[110] px-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ type: 'spring', stiffness: 520, damping: 44 }}
        >
          <div
            className={cn(
              'mx-auto max-w-[520px] rounded-[30px] border border-white/60 bg-white/60 p-5 shadow-lift backdrop-blur-glass',
              'ring-1 ring-black/5',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[12px] font-medium text-ink-700/70">Guided demo</div>
                <div className="mt-1 text-[16px] font-semibold tracking-tightish text-ink-950">
                  {model.title}
                </div>
                <div className="mt-1 text-[12px] leading-5 text-ink-700/65">{model.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={() => stop()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/55 text-ink-950 shadow-soft"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                onClick={() => {
                  if (model.route) nav(model.route)
                  if (step === 'intro') next()
                  else next()
                }}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-ink-950 px-4 py-4 text-[13px] font-semibold text-paper-50 shadow-glowGold"
              >
                {step === 'intro' ? <Play size={18} /> : <ArrowRight size={18} />}
                {model.cta}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  next()
                }}
                className="rounded-3xl border border-white/60 bg-white/55 px-4 py-4 text-[13px] font-semibold text-ink-950 shadow-soft"
              >
                Дальше
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

