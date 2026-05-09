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
      style={
        isGoldHero
          ? {
              borderColor: 'rgba(198, 161, 91, 0.42)',
              borderWidth: 1,
            }
          : undefined
      }
      className={cn(
        'min-h-[190px] p-6 sm:p-6',
        isGoldHero ? 'shadow-soft ring-1 ring-gold-400/28' : undefined,
        compact && 'p-5',
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold',
              isGoldHero
                ? 'border-gold-400/55 bg-gradient-to-b from-gold-200/90 to-paper-50 text-ink-950 shadow-soft'
                : 'border-white/65 bg-white/60 text-ink-900 shadow-soft',
            )}
          >
            <Sparkles size={17} className="text-gold-400" strokeWidth={2} />
            {model.badge ?? 'Focus'}
          </div>

          <div className="mt-4">
            <div
              className={cn(
                'font-semibold tracking-tight text-ink-950',
                isGoldHero ? 'text-[24px] leading-[1.15]' : 'text-[20px] leading-snug',
                compact && (isGoldHero ? 'text-[21px]' : 'text-[18px]'),
              )}
            >
              {model.title}
            </div>
            {model.subtitle ? (
              <div
                className={cn(
                  'mt-2 leading-relaxed text-ink-800/72',
                  compact ? 'line-clamp-2 text-[13px]' : 'text-[15px]',
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
              'inline-flex w-full shrink-0 items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-semibold tracking-tight transition-[filter,transform] duration-200 sm:w-auto',
              isGoldHero
                ? 'rounded-full border border-gold-500/40 bg-[linear-gradient(180deg,#F4D98E_0%,#C6A15B_100%)] text-ink-950 shadow-[0_8px_26px_rgba(198,161,91,0.42)] hover:brightness-[1.04] active:scale-[var(--press-scale,0.992)]'
                : 'lumi-card px-6 py-3.5 text-ink-950 hover:border-white/72 hover:shadow-lift',
              compact && 'px-5 py-3 text-[14px]',
            )}
          >
            {model.cta.label}
            <ArrowRight size={18} className={cn(isGoldHero ? 'text-ink-950' : 'text-gold-400')} strokeWidth={2.25} />
          </button>
        ) : (
          <div className="hidden h-11 w-11 shrink-0 rounded-2xl border border-white/60 bg-[var(--lumi-bg)] shadow-soft sm:block" />
        )}
      </div>
    </GlassCard>
  )
}

export function FocusCardSlot({ children }: { children: ReactNode }) {
  return <div className="mt-3">{children}</div>
}
