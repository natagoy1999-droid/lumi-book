import { motion, useDragControls } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../lib/cn'

type Props = PropsWithChildren<{
  className?: string
  enabled?: boolean
}>

export function SwipeBack({ children, className, enabled = true }: Props) {
  const nav = useNavigate()
  const controls = useDragControls()

  return (
    <motion.div
      className={cn('h-full', className)}
      drag={enabled ? 'x' : false}
      dragControls={controls}
      dragListener={enabled}
      dragElastic={0.14}
      dragConstraints={{ left: 0, right: 120 }}
      onDragEnd={(_, info) => {
        const shouldGoBack = info.offset.x > 88 || info.velocity.x > 800
        if (enabled && shouldGoBack) nav(-1)
      }}
      transition={{ type: 'spring', stiffness: 540, damping: 44 }}
    >
      {children}
    </motion.div>
  )
}

