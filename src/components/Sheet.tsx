import { AnimatePresence, motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import { useModalManager, type ModalId } from '../state/modalManager'
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
  const active = open && children != null
  const modal = useModalManager()
  const centered = variant === 'center'
  const zBackdrop = z.backdrop
  const zModal = z.modal

  useEffect(() => {
    if (!active) return
    modal.open(modalId)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      if (useModalManager.getState().active === modalId) useModalManager.getState().close()
    }
  }, [active, modal, modalId])
  return (
    <AnimatePresence>
      {active ? (
        <>
          <motion.button
            aria-label="Close"
            className="fixed inset-0"
            style={{
              backgroundColor:
                // soft dim only, no heavy blur
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
              'fixed mx-auto max-w-[520px]',
              centered
                ? 'left-1/2 top-1/2'
                : 'bottom-0 left-0 right-0',
              centered ? '' : 'px-3 pb-[calc(14px+var(--safe-bottom))]',
            )}
            style={
              centered
                ? {
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'calc(100% - 32px)',
                    maxWidth: 520,
                    maxHeight: 'calc(100dvh - 140px)',
                    zIndex: zModal,
                  }
                : { zIndex: zModal }
            }
            initial={{ y: centered ? 8 : 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: centered ? 8 : 14, opacity: 0 }}
            transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out }}
          >
            <div
              className={cn(
                'rounded-[28px] border shadow-lift',
                'ring-1 ring-black/5',
                className,
              )}
              style={{
                backdropFilter: surface === 'glass' ? glassBackdropFilter('interactive') : 'none',
                backgroundColor: surface === 'glass' ? glassFill('interactive') : '#FFFDF8',
                borderColor:
                  surface === 'glass' ? glassBorderStyle('interactive') : 'rgba(20,20,20,0.08)',
              }}
            >
              <div className="px-5 pt-5">
                {!centered ? (
                  <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-ink-950/10" />
                ) : null}
                {title ? (
                  <div className="mb-4 text-[13px] font-medium tracking-tightish text-ink-700/78">
                    {title}
                  </div>
                ) : null}
              </div>
              <div
                className="px-5"
                style={{
                  maxHeight: centered ? 'calc(100dvh - 228px)' : undefined,
                  overflowY: centered ? 'auto' : undefined,
                  WebkitOverflowScrolling: centered ? 'touch' : undefined,
                  paddingBottom: centered
                    ? 'calc(28px + env(safe-area-inset-bottom))'
                    : '1.35rem',
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

