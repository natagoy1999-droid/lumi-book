import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { GlassCard } from '../GlassCard'
import { LumiButton } from './LumiButton'

type Props = {
  title: string
  desc?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function LumiEmptyState({
  title,
  desc,
  icon,
  actionLabel,
  onAction,
  className,
}: Props) {
  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 shadow-soft">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="lumi-card-title">{title}</div>
          {desc ? <div className="mt-1 lumi-secondary">{desc}</div> : null}
          {actionLabel && onAction ? (
            <div className="mt-4">
              <LumiButton variant="secondary" size="sm" onClick={onAction}>
                {actionLabel}
              </LumiButton>
            </div>
          ) : null}
        </div>
      </div>
    </GlassCard>
  )
}

