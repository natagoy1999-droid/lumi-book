import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'
import { lumiPrimaryActionMd, lumiPrimaryActionSm } from '../../lib/lumiActionStyles'

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
    ' active:scale-[var(--press-scale,0.992)] active:opacity-[var(--press-opacity,0.94)]'

  const sizing =
    variant === 'primary'
      ? size === 'sm'
        ? lumiPrimaryActionSm
        : lumiPrimaryActionMd
      : size === 'sm'
        ? 'px-4 py-3.5 text-[14px]'
        : 'px-5 py-4 text-[16px]'

  const v =
    variant === 'primary'
      ? ''
      :       variant === 'secondary'
        ? 'border-[1.5px] border-gold-400/35 bg-[var(--lumi-surface)] font-semibold text-ink-950 shadow-soft hover:border-gold-400/50 hover:bg-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]'
        : variant === 'destructive'
          ? 'border border-ink-950/15 bg-ink-900 font-semibold text-paper-50 shadow-soft hover:bg-ink-950 active:bg-[#0d0d0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]'
          : 'font-semibold text-ink-950 hover:bg-white/48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]'

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

