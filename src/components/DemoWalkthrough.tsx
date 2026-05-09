import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import {
  ROUTE_APP_CLIENTS,
  ROUTE_APP_MONEY,
  ROUTE_APP_RESCHEDULE,
  ROUTE_APP_TODAY,
} from '../lib/appRoutes'
import { cn } from '../lib/cn'
import { useDemoMode } from '../state/demoMode'
import { useModalManager } from '../state/modalManager'

const Z_BACKDROP = 9999
const Z_LAYER = 10000

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
          route: ROUTE_APP_TODAY,
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
          route: `${ROUTE_APP_RESCHEDULE}?bookingId=b_t_3&clientId=c4&serviceId=s5&masterId=m1`,
        }
      case 'smart_reminder':
        return {
          idx,
          total,
          title: '3) Напоминание клиенту',
          subtitle:
            'На экране «Сегодня» — мягкие напоминания. Нажмите действие и откройте редактор сообщения.',
          route: ROUTE_APP_TODAY,
        }
      case 'assistant':
        return {
          idx,
          total,
          title: '4) Ассистент',
          subtitle: 'Ассистент предлагает спокойные варианты и помогает держать ритм дня.',
          route: ROUTE_APP_TODAY,
        }
      case 'analytics':
        return {
          idx,
          total,
          title: '5) Деньги',
          subtitle: 'Аналитика считается из реальных записей: день / неделя / месяц / средний чек.',
          route: ROUTE_APP_MONEY,
        }
      case 'followup':
        return {
          idx,
          total,
          title: '6) Сопровождение',
          subtitle: 'Откройте «Клиенты» и нажмите на карточку — можно мягко подготовить контакт.',
          route: ROUTE_APP_CLIENTS,
        }
      case 'done':
        return {
          idx,
          total,
          title: 'Готово',
          subtitle:
            'Это базовый цикл демо-режима. Можно повторить или спокойно вернуться в «Сегодня».',
          route: ROUTE_APP_TODAY,
        }
      default:
        return {
          idx: 1,
          total,
          title: 'Демо',
          subtitle:
            'Короткий обзор Lumi: запись, перенос, напоминания и спокойный ритм дня. Нажмите «Далее», чтобы продолжить.',
          route: ROUTE_APP_TODAY,
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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

  if (!mounted) return null

  const backdropTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }
  const panelTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }

  return createPortal(
    <AnimatePresence>
      {show
        ? [
            <motion.button
              key="demo-walkthrough-backdrop"
              type="button"
              aria-label="Закрыть"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropTransition}
              onClick={() => stop()}
              style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100dvh',
                margin: 0,
                padding: 0,
                border: 'none',
                cursor: 'pointer',
                background: 'rgba(23, 23, 23, 0.28)',
                zIndex: Z_BACKDROP,
              }}
            />,
            <motion.div
              key="demo-walkthrough-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={backdropTransition}
              style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100dvh',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
                paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                boxSizing: 'border-box',
                zIndex: Z_LAYER,
                pointerEvents: 'none',
              }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="demo-walkthrough-title"
                data-demo-walkthrough-modal="1"
                className={cn(
                  'pointer-events-auto relative box-border flex max-h-[calc(100dvh-64px)] w-full flex-col overflow-hidden rounded-[28px]',
                  'border-[1.5px] shadow-luxury-md',
                )}
                style={{
                  width: 'min(520px, calc(100vw - 32px))',
                  maxHeight: 'calc(100dvh - 64px)',
                  backgroundColor: 'var(--lumi-surface)',
                  borderColor: 'rgba(198,161,91,0.48)',
                  boxSizing: 'border-box',
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={panelTransition}
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
            </motion.div>,
          ]
        : null}
    </AnimatePresence>,
    document.body,
  )
}
