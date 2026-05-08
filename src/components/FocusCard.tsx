import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/cn'
import type { FocusCardModel } from '../lib/homeEngine'
import { GlassCard } from './GlassCard'

function breathing() {
  return {
    y: [0, -3, 0],
    transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const },
  }
}

export function FocusCard({
  model,
  compact = false,
  onAction,
}: {
  model: FocusCardModel
  compact?: boolean
  onAction: (action: NonNullable<FocusCardModel['cta']>['action']) => void
}) {
  const toneGlow =
    model.tone === 'gold'
      ? 'shadow-glowGold ring-1 ring-gold-200/60'
      : 'shadow-lift ring-1 ring-black/5'

  return (
    <GlassCard
      materialTier="focus"
      className={cn(
        'p-5',
        toneGlow,
        compact && 'p-4',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/45 px-3 py-1 text-[12px] font-semibold text-ink-800/70 shadow-soft">
            <Sparkles size={16} className="text-gold-400" />
            {model.badge ?? 'Focus'}
          </div>

          <motion.div animate={model.tone === 'gold' ? breathing() : undefined} className="mt-3">
            <div
              className={cn(
                'text-[20px] font-semibold tracking-tightish text-ink-950',
                compact && 'text-[18px]',
              )}
            >
              {model.title}
            </div>
            {model.subtitle ? (
              <div
                className={cn(
                  'mt-1 text-[13px] leading-6 text-ink-700/65',
                  compact && 'line-clamp-1 text-[12px] leading-5',
                )}
              >
                {model.subtitle}
              </div>
            ) : null}
          </motion.div>
        </div>

        {model.cta ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 650, damping: 42 }}
            onClick={() => onAction(model.cta!.action as any)}
            className={cn(
              'mt-1 inline-flex items-center gap-2 rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50',
              'shadow-glowGold',
              compact && 'px-3 py-2 text-[12px]',
            )}
          >
            {model.cta.label}
            <ArrowRight size={16} className="text-gold-400" />
          </motion.button>
        ) : (
          <div className="mt-1 h-10 w-10 rounded-2xl bg-white/55 shadow-soft" />
        )}
      </div>
    </GlassCard>
  )
}

// helper for optional subcontent later
export function FocusCardSlot({ children }: { children: ReactNode }) {
  return <div className="mt-3">{children}</div>
}

