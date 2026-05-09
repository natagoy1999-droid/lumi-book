import { cn } from './cn'

/** Primary — champagne gold gradient, black label (premium CTA). */
export const lumiPrimaryActionBase = cn(
  'rounded-3xl border border-gold-500/40 bg-[linear-gradient(180deg,#F4D98E_0%,#C6A15B_100%)] text-ink-950',
  'shadow-[0_8px_26px_rgba(198,161,91,0.38)]',
  'transition-[transform,filter,box-shadow,border-color,opacity] duration-200 ease-out',
  'hover:brightness-[1.05] hover:shadow-[0_10px_30px_rgba(198,161,91,0.45)]',
  'active:brightness-[0.98] active:scale-[var(--press-scale,0.992)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lumi-bg)]',
)

export const lumiPrimaryActionMd = cn(lumiPrimaryActionBase, 'px-5 py-4 text-[16px] font-semibold')

export const lumiPrimaryActionSm = cn(lumiPrimaryActionBase, 'px-4 py-3 text-[14px] font-semibold')
