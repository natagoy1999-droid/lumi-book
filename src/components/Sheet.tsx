import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassFill } from '../lib/glassStyles'
import { coerceModalId, useModalManager, type ModalId } from '../state/modalManager'
import { motion as motionTokens } from '../theme/motion'

/** Viewport stacking — above app shell / BottomTabs; backdrop below panel */
const Z_BACKDROP = 9999
const Z_LAYER = 10000

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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

  const backdropTransition = {
    duration: motionTokens.duration.normal,
    ease: motionTokens.ease.out,
  } as const

  const panelTransition = {
    duration: motionTokens.duration.slow,
    ease: motionTokens.ease.out,
  } as const

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {active ? (
        centered ? [
            <motion.button
              key="lumi-sheet-backdrop-center"
                type="button"
                aria-label="Закрыть"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={backdropTransition}
                onClick={onClose}
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
              key="lumi-sheet-overlay-center"
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
                  className={cn(
                    'pointer-events-auto relative box-border flex flex-col overflow-y-auto overscroll-contain rounded-[28px] border border-white/60 shadow-soft',
                    className,
                  )}
                  style={{
                    width: 'min(520px, calc(100vw - 32px))',
                    maxHeight: 'calc(100dvh - 64px)',
                    WebkitOverflowScrolling: 'touch',
                    boxSizing: 'border-box',
                    backdropFilter: surface === 'glass' ? glassBackdropFilter('interactive') : 'none',
                    backgroundColor: surface === 'glass' ? glassFill('interactive') : 'var(--lumi-surface)',
                    borderColor: 'rgba(255,255,255,0.6)',
                  }}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={panelTransition}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="box-border min-h-0 flex-1 p-6">
                    <div
                      className={cn(
                        'mb-4 flex items-start gap-3',
                        title ? 'justify-between' : 'justify-end',
                      )}
                    >
                      {title ? (
                        <div className="min-w-0 flex-1 pr-2 text-[15px] font-semibold tracking-tight text-ink-900">
                          {title}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        aria-label="Закрыть"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-white/60 bg-white/55 text-ink-950 shadow-soft"
                      >
                        <X size={18} strokeWidth={1.75} />
                      </button>
                    </div>
                    {children}
                  </div>
                </motion.div>
            </motion.div>,
        ] : [
            <motion.button
              key="lumi-sheet-backdrop-bottom"
                type="button"
                aria-label="Закрыть"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={backdropTransition}
                onClick={onClose}
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
              key="lumi-sheet-overlay-bottom"
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
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                  paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
                  boxSizing: 'border-box',
                  zIndex: Z_LAYER,
                  pointerEvents: 'none',
                }}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  className={cn(
                    'pointer-events-auto box-border max-h-[calc(100dvh-64px)] w-full overflow-hidden rounded-[28px] border border-white/60 shadow-soft',
                    className,
                  )}
                  style={{
                    width: 'min(520px, calc(100vw - 32px))',
                    maxHeight: 'calc(100dvh - 64px)',
                    backdropFilter: surface === 'glass' ? glassBackdropFilter('interactive') : 'none',
                    backgroundColor: surface === 'glass' ? glassFill('interactive') : 'var(--lumi-surface)',
                    borderColor: 'rgba(255,255,255,0.6)',
                  }}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 14, opacity: 0 }}
                  transition={panelTransition}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="box-border flex max-h-[inherit] flex-col overflow-y-auto overscroll-contain">
                    <div className="px-5 pt-5">
                      <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-ink-950/10" />
                      {title ? (
                        <div className="mb-4 text-[15px] font-semibold tracking-tight text-ink-900">{title}</div>
                      ) : null}
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[1.35rem]" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {children}
                    </div>
                  </div>
                </motion.div>
              </motion.div>,
        ]
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
