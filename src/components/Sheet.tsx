import { AnimatePresence, motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'

type Props = PropsWithChildren<{
  open: boolean
  title?: string
  onClose: () => void
  className?: string
}>

export function Sheet({ open, title, onClose, children, className }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close"
            className="fixed inset-0 z-[60]"
            style={{
              backgroundColor:
                'rgba(14, 16, 22, calc(0.25 * var(--chrome-opacity-quiet, 1)))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-[520px]',
              'px-3 pb-[calc(14px+var(--safe-bottom))]',
            )}
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 44, mass: 0.8 }}
          >
            <div
              className={cn(
                'rounded-[28px] border shadow-lift',
                'ring-1 ring-black/5',
                className,
              )}
              style={{
                backdropFilter: glassBackdropFilter('interactive'),
                backgroundColor: glassFill('interactive'),
                borderColor: glassBorderStyle('interactive'),
              }}
            >
              <div className="px-5 pt-4">
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-950/10" />
                {title ? (
                  <div className="mb-3 text-[13px] font-medium tracking-tightish text-ink-700/80">
                    {title}
                  </div>
                ) : null}
              </div>
              <div className="px-5 pb-5">{children}</div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

