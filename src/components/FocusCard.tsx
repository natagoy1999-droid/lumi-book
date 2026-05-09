import { ArrowRight, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/cn'
import type { FocusCardModel } from '../lib/homeEngine'
import { GlassCard } from './GlassCard'

export function FocusCard({
  model,
  compact = false,
  onAction,
}: {
  model: FocusCardModel
  compact?: boolean
  onAction: (action: NonNullable<FocusCardModel['cta']>['action']) => void
}) {
  const isGoldHero = model.tone === 'gold'

  return (
    <GlassCard
      materialTier="focus"
      className={cn(
        'min-h-[190px] p-6 sm:p-6',
        isGoldHero
          ? 'border-2 shadow-luxury-md ring-2 ring-gold-300/35'
          : 'shadow-luxury ring-1 ring-black/[0.04]',
        compact && 'p-5',
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold shadow-soft',
              isGoldHero
                ? 'border-gold-300/50 bg-gradient-to-b from-gold-50 to-paper-50 text-ink-900'
                : 'border-white/60 bg-white/55 text-ink-800/85',
            )}
          >
            <Sparkles size={17} className={cn(isGoldHero ? 'text-gold-300' : 'text-gold-400')} strokeWidth={1.75} />
            {model.badge ?? 'Focus'}
          </div>

          <div className="mt-4">
            <div
              className={cn(
                'font-semibold tracking-tightish text-ink-950',
                isGoldHero ? 'text-[22px] leading-snug' : 'text-[20px]',
                compact && (isGoldHero ? 'text-[20px]' : 'text-[18px]'),
              )}
            >
              {model.title}
            </div>
            {model.subtitle ? (
              <div
                className={cn(
                  'mt-2 leading-relaxed text-[var(--lumi-muted)]',
                  compact ? 'line-clamp-2 text-[13px]' : 'text-[14px]',
                )}
              >
                {model.subtitle}
              </div>
            ) : null}
          </div>
        </div>

        {model.cta ? (
          <button
            type="button"
            onClick={() => onAction(model.cta!.action as any)}
            className={cn(
              'inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-3xl border px-5 py-3.5 text-[14px] font-semibold text-ink-950 shadow-luxury transition-[transform,box-shadow] duration-200 sm:w-auto',
              isGoldHero
                ? 'border-gold-300/55 bg-gradient-to-b from-gold-100 via-gold-50 to-paper-50 hover:border-gold-300/70 hover:shadow-luxury-md'
                : 'border-gold-300/45 bg-paper-50 hover:bg-[#FFFCF9] hover:shadow-luxury-md',
              compact && 'px-4 py-3 text-[13px]',
            )}
          >
            {model.cta.label}
            <ArrowRight size={17} className="text-gold-400" strokeWidth={2} />
          </button>
        ) : (
          <div className="hidden h-11 w-11 shrink-0 rounded-2xl border border-[var(--lumi-border)] bg-[var(--lumi-surface)] shadow-soft sm:block" />
        )}
      </div>
    </GlassCard>
  )
}

export function FocusCardSlot({ children }: { children: ReactNode }) {
  return <div className="mt-3">{children}</div>
}
