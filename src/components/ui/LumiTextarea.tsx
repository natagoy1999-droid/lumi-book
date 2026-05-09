import type { TextareaHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
}

export function LumiTextarea({ className, label, hint, ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="lumi-caption mb-2">{label}</div> : null}
      <textarea
        {...props}
        className={cn(
          'w-full resize-none rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[15px] leading-6 text-ink-950 shadow-soft',
          'outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out',
          'placeholder:text-ink-700/35 focus-visible:ring-2 focus-visible:ring-gold-200/60',
          className,
        )}
      />
      {hint ? <div className="lumi-secondary mt-2">{hint}</div> : null}
    </label>
  )
}

