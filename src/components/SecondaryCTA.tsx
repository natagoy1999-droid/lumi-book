import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { cn } from '../lib/cn'
import { glassBackdropFilter } from '../lib/glassStyles'

export function SecondaryCTA({
  label,
  tone = 'gold',
  onClick,
  compact = false,
}: {
  label: string
  tone?: 'gold' | 'ink'
  onClick: () => void
  compact?: boolean
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 720, damping: 46, mass: 0.8 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold shadow-soft',
        'border',
        tone === 'gold'
          ? 'bg-ink-950 text-paper-50 border-gold-200/60 shadow-glowGold'
          : 'bg-white/55 text-ink-950 border-white/60',
        compact && 'px-3 py-2 text-[11px]',
      )}
      style={{
        backdropFilter:
          tone === 'gold' ? 'none' : glassBackdropFilter('interactive'),
        transform: 'scale(var(--compact-scale, 1))',
      }}
    >
      <Sparkles size={14} className="text-gold-400" />
      {label}
    </motion.button>
  )
}

