import { cn } from '../lib/cn'

type Props = {
  className?: string
}

export function Skeleton({ className }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden lumi-card-nested bg-white/45',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(90%_65%_at_50%_35%,black,transparent)]">
        <div className="h-full w-[140%] -translate-x-[30%] bg-gradient-to-r from-transparent via-white/65 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}

