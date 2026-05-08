import { AnimatePresence, motion } from 'framer-motion'

import { dockSecondaryPillOpacity } from '../lib/advisoryDelicacy'
import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'

export type CompactPill = { id: string; text: string; tone?: 'gold' | 'ink' }

export function CompactPills({ pills }: { pills: CompactPill[] }) {
  if (!pills.length) return null

  return (
    <div
      className="relative mt-2 flex overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
      style={{ gap: 'var(--compact-spacing, 8px)' }}
    >
      <AnimatePresence initial={false}>
        {pills.slice(0, 4).map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 560, damping: 44, mass: 0.85 }}
            className={cn(
              'rounded-full border font-semibold shadow-soft',
              p.tone === 'gold'
                ? 'border-gold-200/60 text-ink-950'
                : 'text-ink-800/70',
            )}
            style={{
              opacity: dockSecondaryPillOpacity(),
              backdropFilter: glassBackdropFilter('focus'),
              backgroundColor: glassFill('focus'),
              borderColor:
                p.tone === 'gold' ? 'rgba(214, 178, 90, 0.42)' : glassBorderStyle('focus'),
              fontSize: 'var(--pill-font, 12px)',
              paddingLeft: 'var(--pill-pad-x, 14px)',
              paddingRight: 'var(--pill-pad-x, 14px)',
              paddingTop: 'var(--pill-pad-y, 10px)',
              paddingBottom: 'var(--pill-pad-y, 10px)',
            }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

