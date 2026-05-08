import { motion } from 'framer-motion'
import type { CSSProperties, PropsWithChildren } from 'react'

import { cn } from '../lib/cn'
import type { MaterialTier } from '../lib/glassStyles'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import { cinematicAmbientWash, cinematicHighlightOpacity, cinematicWashOpacity } from '../lib/cinematicGlass'

type Props = PropsWithChildren<{
  className?: string
  onClick?: () => void
  tone?: 'paper' | 'ink'
  /** Unified global material tier — defaults to interactive glass */
  materialTier?: MaterialTier
  style?: CSSProperties
}>

export function GlassCard({
  children,
  className,
  onClick,
  tone = 'paper',
  materialTier = 'interactive',
  style: styleProp,
}: Props) {
  const ink = tone === 'ink'

  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.985, y: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 550, damping: 38, mass: 0.7 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border shadow-soft',
        'ring-1 ring-black/5',
        ink ? 'bg-ink-900/70 text-white' : 'text-ink-900',
        onClick && 'cursor-pointer select-none',
        className,
      )}
      style={{
        backdropFilter: glassBackdropFilter(ink ? 'interactive' : materialTier),
        borderColor: ink ? 'rgba(255,255,255,0.10)' : glassBorderStyle(materialTier),
        backgroundColor: ink ? undefined : glassFill(materialTier),
        ...styleProp,
      }}
    >
      {!ink ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage: cinematicAmbientWash(),
            opacity: cinematicWashOpacity(),
            mixBlendMode: 'soft-light',
          }}
        />
      ) : null}
      <div
        className="pointer-events-none absolute -top-10 left-0 h-24 w-full bg-gradient-to-b from-white/40 to-transparent"
        style={{
          opacity: ink
            ? 'calc(0.22 * (1 - var(--global-glass-quiet, 0)))'
            : cinematicHighlightOpacity(),
        }}
      />
      {children}
    </motion.div>
  )
}
