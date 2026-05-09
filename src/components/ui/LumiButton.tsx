import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export type LumiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type LumiButtonSize = 'md' | 'sm'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: LumiButtonVariant
  size?: LumiButtonSize
  fullWidth?: boolean
}

export function LumiButton({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  disabled,
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap touch-manipulation' +
    ' rounded-3xl transition-[transform,background-color,border-color,box-shadow,color,opacity] duration-[240ms] ease-out' +
    ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]' +
    ' active:scale-[var(--press-scale,0.992)] active:opacity-[var(--press-opacity,0.94)]'

  const sizing = size === 'sm' ? 'px-4 py-3 text-[13px]' : 'px-5 py-4 text-[15px]'

  const v =
    variant === 'primary'
      ? 'bg-ink-950 text-paper-50 shadow-glowGold hover:bg-ink-950/95'
      : variant === 'secondary'
        ? 'border border-white/60 bg-white/62 text-ink-950 shadow-soft hover:bg-white/72'
        : variant === 'destructive'
          ? 'bg-ink-950 text-paper-50 shadow-soft ring-1 ring-red-200/50'
          : 'bg-transparent text-ink-950 hover:bg-white/48'

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        base,
        sizing,
        v,
        fullWidth && 'w-full',
        disabled && 'opacity-70 active:scale-100',
        className,
      )}
    />
  )
}

