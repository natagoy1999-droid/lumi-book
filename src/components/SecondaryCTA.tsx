import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { cn } from '../lib/cn'
import { lumiPrimaryActionSm } from '../lib/lumiActionStyles'
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
        'inline-flex items-center gap-2 font-semibold',
        tone === 'gold'
          ? cn(lumiPrimaryActionSm, '!rounded-full px-4 py-2 text-[13px]')
          : 'rounded-full border border-white/65 bg-white/68 px-4 py-2 text-[13px] text-ink-950 shadow-soft',
        compact && 'px-3 py-2 text-[12px]',
      )}
      style={{
        backdropFilter:
          tone === 'gold' ? 'none' : glassBackdropFilter('interactive'),
        transform: 'scale(var(--compact-scale, 1))',
      }}
    >
      <Sparkles size={14} className="text-gold-300/90" />
      {label}
    </motion.button>
  )
}

