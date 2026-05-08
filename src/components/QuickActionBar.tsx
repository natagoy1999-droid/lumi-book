import { motion } from 'framer-motion'
import { CalendarDays, MessageCircle, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'

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
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 520, damping: 44 }}
        className={cn('rounded-[26px] border px-3 py-2 shadow-soft', 'ring-1 ring-black/5')}
        style={{
          backdropFilter: glassBackdropFilter('interactive'),
          backgroundColor: glassFill('interactive'),
          borderColor: glassBorderStyle('interactive'),
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] font-medium text-ink-700/70">Quick actions</div>
          <button
            type="button"
            onClick={() => nav('/calendar')}
            className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-soft"
          >
            Календарь
          </button>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {list.map((a) => {
            const Icon = a.icon ? iconMap[a.icon] : undefined
            return (
              <motion.button
                key={a.id}
                type="button"
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 650, damping: 42 }}
                onClick={a.onClick}
                className={cn(
                  'inline-flex items-center gap-2 whitespace-nowrap rounded-3xl px-4 py-3 text-[13px] font-semibold shadow-soft',
                  a.tone === 'gold'
                    ? 'bg-ink-950 text-paper-50 shadow-glowGold'
                    : 'border border-white/60 bg-white/55 text-ink-950',
                )}
              >
                {Icon ? <Icon size={16} className="text-gold-400" /> : null}
                {a.label}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

