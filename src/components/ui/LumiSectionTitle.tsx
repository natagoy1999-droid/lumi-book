import type { PropsWithChildren } from 'react'

import { cn } from '../../lib/cn'

export function LumiSectionTitle({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('lumi-section-title', className)}>{children}</div>
}

