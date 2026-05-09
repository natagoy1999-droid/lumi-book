import { AnimatePresence, motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import { coerceModalId, useModalManager, type ModalId } from '../state/modalManager'
import { z } from '../theme/elevation'
import { motion as motionTokens } from '../theme/motion'

type Props = PropsWithChildren<{
  open: boolean
  title?: string
  onClose: () => void
  className?: string
  variant?: 'bottom' | 'center'
  surface?: 'glass' | 'solid'
  modalId?: ModalId
}>

export function Sheet({
  open,
  title,
  onClose,
  children,
  className,
  variant = 'bottom',
  surface = 'glass',
  modalId = 'settings',
}: Props) {
  const resolvedModalId = coerceModalId(modalId)
  const active = open && children != null
  const centered = variant === 'center'
  const zBackdrop = z.backdrop
  const zModal = z.modal

  // Do not depend on `useModalManager()` snapshot — it changes identity every store update and
  // would re-run this effect, firing cleanup that closes the modal → infinite loop (React #185).
  useEffect(() => {
    if (!active) return
    useModalManager.getState().open(resolvedModalId)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      if (useModalManager.getState().active === resolvedModalId) useModalManager.getState().close()
    }
  }, [active, resolvedModalId])

  return (
    <AnimatePresence>
      {active ? (
        centered ? (
          <motion.div
            key="sheet-center"
            className="fixed inset-0 box-border flex items-center justify-center pointer-events-none"
            style={{
              zIndex: zModal,
              padding: 24,
              paddingTop: 'calc(24px + env(safe-area-inset-top))',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: motionTokens.ease.out }}
          >
            <motion.button
              type="button"
              aria-label="Закрыть"
              className="pointer-events-auto absolute inset-0"
              style={{
                backgroundColor:
                  'rgba(14, 16, 22, calc(0.28 * var(--chrome-opacity-quiet, 1)))',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionTokens.duration.normal, ease: motionTokens.ease.out }}
              onClick={onClose}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              className={cn(
                'pointer-events-auto relative box-border flex max-h-[calc(100dvh-64px)] w-full flex-col overflow-hidden rounded-[28px] border shadow-luxury-md',
                className,
              )}
              style={{
                width: 'min(520px, calc(100vw - 32px))',
                maxHeight: 'calc(100dvh - 64px)',
                backdropFilter: surface === 'glass' ? glassBackdropFilter('interactive') : 'none',
                backgroundColor: surface === 'glass' ? glassFill('interactive') : 'var(--lumi-surface)',
                borderColor: surface === 'glass' ? glassBorderStyle('interactive') : 'var(--lumi-border)',
              }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="box-border min-h-0 flex-1 overflow-y-auto overscroll-contain p-6"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {title ? (
                  <div className="mb-4 text-[15px] font-semibold tracking-tight text-ink-900">
                    {title}
                  </div>
                ) : null}
                {children}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <motion.button
              aria-label="Закрыть"
              className="fixed inset-0"
              style={{
                backgroundColor:
                  'rgba(14, 16, 22, calc(0.28 * var(--chrome-opacity-quiet, 1)))',
                zIndex: zBackdrop,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              transition={{ duration: motionTokens.duration.normal, ease: motionTokens.ease.out }}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              className={cn(
                'fixed bottom-0 left-0 right-0 mx-auto max-w-[520px] px-3 pb-[calc(14px+var(--safe-bottom))]',
              )}
              style={{ zIndex: zModal }}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 14, opacity: 0 }}
              transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out }}
            >
              <div
                className={cn('rounded-[28px] border shadow-luxury', className)}
                style={{
                  backdropFilter: surface === 'glass' ? glassBackdropFilter('interactive') : 'none',
                  backgroundColor: surface === 'glass' ? glassFill('interactive') : 'var(--lumi-surface)',
                  borderColor: surface === 'glass' ? glassBorderStyle('interactive') : 'var(--lumi-border)',
                }}
              >
                <div className="px-5 pt-5">
                  <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-ink-950/10" />
                  {title ? (
                    <div className="mb-4 text-[15px] font-semibold tracking-tight text-ink-900">{title}</div>
                  ) : null}
                </div>
                <div
                  className="px-5"
                  style={{
                    paddingBottom: '1.35rem',
                  }}
                >
                  {children}
                </div>
              </div>
            </motion.div>
          </>
        )
      ) : null}
    </AnimatePresence>
  )
}
