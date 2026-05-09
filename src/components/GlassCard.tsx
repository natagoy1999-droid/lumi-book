import type { CSSProperties, KeyboardEventHandler, PropsWithChildren } from 'react'

import { cn } from '../lib/cn'
import type { MaterialTier } from '../lib/glassStyles'
import { glassBackdropFilter, glassFill } from '../lib/glassStyles'
import { cinematicAmbientWash, cinematicHighlightOpacity, cinematicWashOpacity } from '../lib/cinematicGlass'

type Props = PropsWithChildren<{
  className?: string
  onClick?: () => void
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
  tone?: 'paper' | 'ink'
  /** Unified global material tier — defaults to interactive glass */
  materialTier?: MaterialTier
  style?: CSSProperties
}>

export function GlassCard({
  children,
  className,
  onClick,
  onKeyDown,
  tone = 'paper',
  materialTier = 'interactive',
  style: styleProp,
}: Props) {
  const ink = tone === 'ink'

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        'relative overflow-hidden rounded-3xl border shadow-luxury',
        'transition-[transform,background-color,border-color,box-shadow,opacity] duration-[240ms] ease-out',
        ink ? 'bg-ink-900/70 text-white ring-1 ring-white/10' : 'text-ink-900 ring-1 ring-black/[0.03]',
        onClick &&
          'touch-manipulation cursor-pointer select-none active:scale-[var(--press-scale,0.992)] active:opacity-[var(--press-opacity,0.94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
        onClick && 'hover:shadow-luxury-md hover:border-gold-300/40',
        className,
      )}
      style={{
        backdropFilter: glassBackdropFilter(ink ? 'interactive' : materialTier),
        borderColor: ink ? 'rgba(255,255,255,0.10)' : 'var(--lumi-border)',
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
    </div>
  )
}
