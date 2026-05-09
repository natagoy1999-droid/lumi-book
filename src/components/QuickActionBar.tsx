import { CalendarDays, MessageCircle, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTE_APP_CALENDAR } from '../lib/appRoutes'
import { cn } from '../lib/cn'
import { lumiPrimaryActionSm } from '../lib/lumiActionStyles'

export type QuickAction = {
  id: string
  label: string
  onClick: () => void
  tone?: 'gold' | 'ink'
  icon?: 'sparkle' | 'msg' | 'cal'
}

const iconMap = {
  sparkle: Sparkles,
  msg: MessageCircle,
  cal: CalendarDays,
} as const

export function QuickActionBar({
  actions,
}: {
  actions: QuickAction[]
}) {
  const nav = useNavigate()
  const list = useMemo(() => actions.slice(0, 4), [actions])
  if (!list.length) return null

  return (
    <div className="mt-3">
      <div
        className={cn('rounded-[26px] border px-3 py-2 shadow-soft', 'ring-1 ring-black/5')}
        style={{
          backgroundColor: '#FFFDF8',
          borderColor: 'rgba(198, 165, 106, 0.14)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] font-medium text-ink-700/70">Быстрые действия</div>
          <button
            type="button"
            onClick={() => nav(ROUTE_APP_CALENDAR)}
            className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-soft"
          >
            Календарь
          </button>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {list.map((a) => {
            const Icon = a.icon ? iconMap[a.icon] : undefined
            return (
              <button
                key={a.id}
                type="button"
                onClick={a.onClick}
                className={cn(
                  'inline-flex items-center gap-2 whitespace-nowrap font-semibold',
                  a.tone === 'gold'
                    ? lumiPrimaryActionSm
                    : 'lumi-card bg-white/68 px-4 py-3 text-[14px] text-ink-950',
                )}
              >
                {Icon ? <Icon size={16} className="text-gold-300/85" /> : null}
                {a.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

