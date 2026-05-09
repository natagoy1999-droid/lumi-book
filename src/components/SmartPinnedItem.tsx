import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassFill } from '../lib/glassStyles'
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
        'lumi-card px-4 py-3',
        item.tone === 'gold' ? 'ring-1 ring-gold-400/28' : undefined,
      )}
      style={{
        backdropFilter: glassBackdropFilter('interactive'),
        backgroundColor: glassFill('interactive'),
        borderColor: item.tone === 'gold' ? 'rgba(214, 178, 90, 0.35)' : 'rgba(255,255,255,0.6)',
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

