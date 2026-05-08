import { AnimatePresence, motion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type React from 'react'

import { cn } from '../lib/cn'
import { AdaptivePill } from './AdaptivePill'
import { secondaryDelaySeconds } from '../lib/staggerMotion'
import { dominantOpacity, oldDominantOpacity, secondaryDim } from '../lib/weightTransfer'
import { getVarNumber } from '../lib/breathingFreeze'
import { settleKeyframes } from '../lib/subPixelSettle'

export type ActionPill = {
  id: string
  label: string
  onClick: () => void
  score: number
  role: 'dominant' | 'secondary'
}

export function ActionPills({
  actions,
  compactness = 'ultra',
}: {
  actions: ActionPill[]
  compactness?: 'normal' | 'ultra'
}) {
  if (!actions.length) return null

  const list = actions
    .slice()
    .sort((a, b) => (a.role === 'dominant' ? -1 : 1) - (b.role === 'dominant' ? -1 : 1))

  const dominantId = list.find((x) => x.role === 'dominant')?.id ?? list[0]?.id ?? 'none'
  const prevDominantId = useRef(dominantId)
  const transferFrom = useRef<string | null>(null)
  const t = useSpring(1, { stiffness: 420, damping: 54, mass: 1.0 })

  useEffect(() => {
    if (dominantId === prevDominantId.current) return
    transferFrom.current = prevDominantId.current
    prevDominantId.current = dominantId
    t.set(0)
    t.set(1)
  }, [dominantId, t])

  return (
    <div
      className={cn('relative mt-2 flex flex-wrap', compactness === 'ultra' && 'gap-1.5')}
      style={{ gap: 'var(--cta-gap, 8px)' }}
    >
      <AnimatePresence initial={false}>
        {list.map((a) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{
              type: 'spring',
              stiffness: a.role === 'dominant' ? 520 : 680,
              damping: a.role === 'dominant' ? 44 : 50,
              mass: a.role === 'dominant' ? 0.9 : 0.75,
              delay: a.role === 'dominant' ? 0 : secondaryDelaySeconds(),
            }}
            style={
              a.role === 'dominant'
                ? {
                    marginRight: 'var(--dominant-push, 4px)',
                  }
                : undefined
            }
          >
            <OpacityTransfer
              t={t}
              id={a.id}
              dominantId={dominantId}
              fromId={transferFrom.current}
            >
              <AdaptivePill
                label={a.label}
                onClick={a.onClick}
                score={a.score}
                role={a.role}
                compactness={compactness}
              />
            </OpacityTransfer>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function OpacityTransfer({
  t,
  id,
  dominantId,
  fromId,
  children,
}: {
  t: MotionValue<number>
  id: string
  dominantId: string
  fromId: string | null
  children: React.ReactNode
}) {
  const opacity = useTransform(t, (x: number) => {
    if (id === dominantId) return dominantOpacity(x)
    if (fromId && id === fromId) return oldDominantOpacity(x)
    return secondaryDim(x)
  })

  const isDominant = id === dominantId
  const amp = getVarNumber('--settle-amplitude', 0.9)
  const still = getVarNumber('--urgency-stillness', 0)
  const settleAmp = isDominant ? amp * (1 - still * 0.55) : 0
  const duration = getVarNumber('--settle-duration', 320)
  const inertia = getVarNumber('--layout-inertia', 1)
  const secondaryFade = getVarNumber('--secondary-fade', 0)

  return (
    <motion.div
      style={{
        opacity: useTransform(opacity, (o: number) =>
          isDominant ? o : o * (1 - secondaryFade * 0.22),
        ),
      }}
      animate={isDominant ? { y: settleKeyframes(settleAmp) } : undefined}
      transition={
        isDominant
          ? {
              duration: (duration / 1000) * inertia,
              ease: [0.22, 1, 0.36, 1],
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  )
}

