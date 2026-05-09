import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
}

export function LumiInput({ className, label, hint, ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="lumi-caption mb-2">{label}</div> : null}
      <input
        {...props}
        className={cn(
          'min-h-[48px] w-full touch-manipulation rounded-3xl border border-white/60 bg-white/62 px-4 py-3.5 text-[15px] leading-snug text-ink-950 shadow-soft',
          'outline-none transition-[border-color,box-shadow,background-color] duration-[240ms] ease-out',
          'placeholder:text-ink-700/35 focus-visible:border-gold-200/40 focus-visible:ring-2 focus-visible:ring-gold-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]',
          className,
        )}
      />
      {hint ? <div className="lumi-secondary mt-2">{hint}</div> : null}
    </label>
  )
}

