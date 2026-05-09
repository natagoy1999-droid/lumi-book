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
          'lumi-card w-full resize-none bg-paper-50/90 px-4 py-3 text-[16px] leading-6 text-ink-950 caret-ink-950',
          'outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out',
          'placeholder:text-ink-700/42 focus-visible:border-gold-300/35 focus-visible:ring-2 focus-visible:ring-gold-300/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]',
          className,
        )}
      />
      {hint ? <div className="lumi-secondary mt-2">{hint}</div> : null}
    </label>
  )
}

