import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

import { cn } from '../lib/cn'
import { dockCtaShadowClass, dockGlowOpacityExpr } from '../lib/advisoryDelicacy'
import { focusDockBadge } from '../lib/humaneWording'
import { cinematicAmbientWash, cinematicWashOpacity } from '../lib/cinematicGlass'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import type { FocusCardModel } from '../lib/homeEngine'
import { useCommunicationCalmIntel } from '../state/communicationCalmIntel'
import { useCognitiveUI } from '../state/cognitiveUI'
import { CompactPills, type CompactPill } from './CompactPills'
import type { SmartPinnedItem } from '../lib/pinningEngine'
import { SmartPinnedItemView } from './SmartPinnedItem'
import { ActionPills, type ActionPill } from './ActionPills'

function breathingGlow() {
  return {
    opacity: [0.35, 0.65, 0.35],
    transition: { duration: 3.1, repeat: Infinity, ease: 'easeInOut' as const },
  }
}

export function FocusDock({
  visible,
  model,
  onAction,
  pills,
  secondary,
  actions,
  ultra = true,
}: {
  visible: boolean
  model: FocusCardModel
  onAction: (action: NonNullable<FocusCardModel['cta']>['action']) => void
  pills: CompactPill[]
  secondary?: SmartPinnedItem | null
  actions: ActionPill[]
  ultra?: boolean
}) {
  const cognitiveLoad = useCognitiveUI((s) => s.policy.load)
  const socialQuietness = useCommunicationCalmIntel((s) => s.snapshot?.socialQuietness ?? 0.35)
  const calmDock = cognitiveLoad > 0.52 || socialQuietness > 0.58
  const pad = 'calc(0.75rem * (0.9 + var(--global-rhythm, 1) * 0.1))'
  const padX = 'calc(1.25rem * (0.94 + var(--global-rhythm, 1) * 0.06))'

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[80]"
          style={{ paddingLeft: padX, paddingRight: padX, paddingTop: pad }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            type: 'spring',
            stiffness: 526 - cognitiveLoad * 74,
            damping: 44 + cognitiveLoad * 9,
          }}
        >
          <div className="mx-auto max-w-[520px]">
            <motion.div
              layout
              className={cn(
                'relative overflow-hidden rounded-[26px] border shadow-lift',
                'ring-1 ring-black/5',
              )}
              style={{
                backdropFilter: glassBackdropFilter('focus'),
                backgroundColor: glassFill('focus'),
                boxShadow: 'var(--dock-shadow)',
                borderColor: glassBorderStyle('focus'),
                transform: 'scale(var(--compact-scale, 1))',
                opacity: 'var(--focus-opacity, 1)',
                minHeight: 'var(--dock-height, 104px)',
                paddingLeft: 'var(--dock-pad-x, 16px)',
                paddingRight: 'var(--dock-pad-x, 16px)',
                paddingTop: 'var(--dock-pad-y, 12px)',
                paddingBottom: 'var(--dock-pad-y, 12px)',
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  backgroundImage: cinematicAmbientWash(),
                  opacity: cinematicWashOpacity(),
                  mixBlendMode: 'soft-light',
                }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(520px 220px at 14% 0%, rgba(214,178,90,calc(0.24 * var(--ambient-light, 1))), transparent 55%)',
                  ...(calmDock ? { opacity: dockGlowOpacityExpr() } : {}),
                }}
                animate={calmDock ? false : breathingGlow()}
              />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-1 text-[11px] font-semibold text-ink-800/70 shadow-soft">
                    <Sparkles size={14} className="text-gold-400" />
                    {focusDockBadge(socialQuietness)}
                  </div>
                  <div
                    className="mt-2 font-semibold tracking-tightish text-ink-950 line-clamp-1"
                    style={{ fontSize: 'var(--dock-title-size, 14px)' }}
                  >
                    {model.title}
                  </div>
                  {model.subtitle ? (
                    <div
                      className="mt-0.5 text-ink-700/65 line-clamp-1"
                      style={{ fontSize: 'var(--dock-subtitle-size, 12px)' }}
                    >
                      {model.subtitle}
                    </div>
                  ) : null}
                </div>

                {model.cta ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.985 }}
                    transition={{
                      type: 'spring',
                      stiffness: Math.round(652 - cognitiveLoad * 92),
                      damping: 42 + cognitiveLoad * 10,
                    }}
                    onClick={() => onAction(model.cta!.action)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-3xl bg-ink-950 px-4 py-3 text-[12px] font-semibold text-paper-50',
                      dockCtaShadowClass(socialQuietness),
                    )}
                  >
                    {model.cta.label}
                    <ArrowRight size={16} className="text-gold-400" />
                  </motion.button>
                ) : (
                  <div className="h-10 w-10 rounded-2xl bg-white/55 shadow-soft" />
                )}
              </div>

              {/* ultra-compact: keep only primary info + CTAs + pills */}
              {!ultra && secondary ? (
                <div className="relative mt-2">
                  <SmartPinnedItemView item={secondary} />
                </div>
              ) : null}

              <div style={{ marginTop: 'var(--magnetic-gap, 8px)' }}>
                <ActionPills actions={actions} compactness={ultra ? 'ultra' : 'normal'} />
              </div>
              <CompactPills pills={pills} />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

