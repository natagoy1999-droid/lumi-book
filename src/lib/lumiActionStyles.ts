import { cn } from './cn'

/** Premium primary: warm ivory, champagne gold edge, near-black label — not a solid black pill. */
export const lumiPrimaryActionBase = cn(
  'rounded-3xl border border-gold-300/45 bg-paper-50 text-ink-950',
  'shadow-luxury',
  'transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 ease-out',
  'hover:border-gold-300/60 hover:bg-[#FFFCF9] hover:shadow-luxury-md',
  'active:bg-gold-50/70 active:border-gold-300/55',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]',
)

export const lumiPrimaryActionMd = cn(lumiPrimaryActionBase, 'px-5 py-4 text-[16px] font-semibold')

export const lumiPrimaryActionSm = cn(lumiPrimaryActionBase, 'px-4 py-3 text-[14px] font-semibold')
