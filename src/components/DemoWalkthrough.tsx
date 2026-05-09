import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../lib/cn'
import { useDemoMode } from '../state/demoMode'
import { useModalManager } from '../state/modalManager'
import { z } from '../theme/elevation'

type StepModel = {
  idx: number
  total: number
  title: string
  subtitle: string
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
          title: 'Демо • 60–90 секунд',
          subtitle:
            'Пройдём ключевые сценарии: запись → перенос → напоминание → ассистент → деньги → сопровождение.',
          route: '/today',
        }
      case 'create_booking':
        return {
          idx,
          total,
          title: '1) Создание записи',
          subtitle:
            'Откройте онлайн-запись и выберите услугу → мастера → дату → время. Затем вернитесь сюда при желании.',
          route: '/book/demo',
        }
      case 'reschedule':
        return {
          idx,
          total,
          title: '2) Перенос',
          subtitle:
            'Откройте перенос — слоты уже готовы. Отправьте предложение: это учебная отправка без реального SMS.',
          route: '/reschedule?bookingId=b_t_3&clientId=c4&serviceId=s5&masterId=m1',
        }
      case 'smart_reminder':
        return {
          idx,
          total,
          title: '3) Напоминание клиенту',
          subtitle:
            'На экране «Сегодня» — мягкие напоминания. Нажмите действие и откройте редактор сообщения.',
          route: '/today',
        }
      case 'assistant':
        return {
          idx,
          total,
          title: '4) Ассистент',
          subtitle: 'Ассистент предлагает спокойные варианты и помогает держать ритм дня.',
          route: '/today',
        }
      case 'analytics':
        return {
          idx,
          total,
          title: '5) Деньги',
          subtitle: 'Аналитика считается из реальных записей: день / неделя / месяц / средний чек.',
          route: '/money',
        }
      case 'followup':
        return {
          idx,
          total,
          title: '6) Сопровождение',
          subtitle: 'Откройте «Клиенты» и нажмите на карточку — можно мягко подготовить контакт.',
          route: '/clients',
        }
      case 'done':
        return {
          idx,
          total,
          title: 'Готово',
          subtitle:
            'Это базовый цикл демо-режима. Можно повторить или спокойно вернуться в «Сегодня».',
          route: '/today',
        }
      default:
        return {
          idx: 1,
          total,
          title: 'Демо',
          subtitle:
            'Короткий обзор Lumi: запись, перенос, напоминания и спокойный ритм дня. Нажмите «Далее», чтобы продолжить.',
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

  const show = Boolean(active && model?.title && model?.subtitle)

  useEffect(() => {
    if (!show) return
    useModalManager.getState().open('walkthrough')
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
      if (useModalManager.getState().active === 'walkthrough') useModalManager.getState().close()
    }
  }, [show])

  useEffect(() => {
    if (!active) return
    const t = window.setTimeout(() => {
      const stillActive = useDemoMode.getState().active
      if (!stillActive) return
      const hasModal = Boolean(document.querySelector('[data-demo-walkthrough-modal="1"]'))
      if (!hasModal) {
        useDemoMode.getState().stop()
      }
    }, 3000)
    return () => window.clearTimeout(t)
  }, [active, step])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="demo-walkthrough-shell"
          className="fixed inset-0 box-border flex items-center justify-center pointer-events-none"
          style={{
            zIndex: z.walkthroughModal,
            padding: 24,
            paddingTop: 'calc(24px + env(safe-area-inset-top))',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="button"
            aria-label="Закрыть"
            className="pointer-events-auto absolute inset-0 cursor-default"
            style={{
              backgroundColor: 'rgba(14, 16, 22, 0.28)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => stop()}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-walkthrough-title"
            data-demo-walkthrough-modal="1"
            className={cn(
              'pointer-events-auto relative box-border flex max-h-[calc(100dvh-64px)] w-full flex-col overflow-hidden rounded-[28px]',
              'border shadow-luxury-md',
            )}
            style={{
              width: 'min(520px, calc(100vw - 32px))',
              maxHeight: 'calc(100dvh - 64px)',
              backgroundColor: 'var(--lumi-surface)',
              borderColor: 'var(--lumi-border)',
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 pb-3"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-ink-700/70">
                    Пошаговое демо • шаг {model.idx}/{model.total}
                  </div>
                  <div
                    id="demo-walkthrough-title"
                    className="mt-1 text-[16px] font-semibold tracking-tightish text-ink-950"
                  >
                    {model.title}
                  </div>
                  <div className="mt-2 text-[12px] leading-[1.55] text-ink-700/65">{model.subtitle}</div>
                </div>
                <button
                  type="button"
                  onClick={() => stop()}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/60 text-ink-950 shadow-soft"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="shrink-0 border-t border-black/[0.06] px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => prev()}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/60 bg-white/60 px-3 py-3.5 text-[13px] font-semibold text-ink-950 shadow-soft"
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
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-ink-950 px-3 py-3.5 text-[13px] font-semibold text-paper-50 shadow-glowGold"
                >
                  <ArrowRight size={18} />
                  Далее
                </motion.button>

                <button
                  type="button"
                  onClick={() => stop()}
                  className="rounded-3xl border border-white/60 bg-white/60 px-3 py-3.5 text-[13px] font-semibold text-ink-950 shadow-soft"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
