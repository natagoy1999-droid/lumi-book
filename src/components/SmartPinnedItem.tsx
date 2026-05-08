import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import type { SmartPinnedItem } from '../lib/pinningEngine'

export function SmartPinnedItemView({ item }: { item: SmartPinnedItem }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 560, damping: 44, mass: 0.85 }}
      className={cn(
        'rounded-3xl border px-4 py-3 shadow-soft',
        item.tone === 'gold'
          ? 'border-gold-200/60 ring-1 ring-gold-200/50'
          : 'ring-1 ring-black/5',
      )}
      style={{
        backdropFilter: glassBackdropFilter('interactive'),
        backgroundColor: glassFill('interactive'),
        borderColor:
          item.tone === 'gold'
            ? 'rgba(214, 178, 90, 0.38)'
            : glassBorderStyle('interactive'),
        transform: 'scale(var(--compact-scale, 1))',
      }}
    >
      <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink-800/70">
        <Sparkles size={14} className="text-gold-400" />
        {item.text}
      </div>
    </motion.div>
  )
}

