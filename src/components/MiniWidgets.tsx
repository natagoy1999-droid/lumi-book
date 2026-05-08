import { motion } from 'framer-motion'
import { CreditCard, Gauge, History, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import type { HomeWidgets } from '../lib/homeEngine'
import { useCognitiveUI } from '../state/cognitiveUI'

function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.round(n)))
}

export function MiniWidgets({
  widgets,
  compact = false,
  hideRecovery = false,
}: {
  widgets: HomeWidgets
  compact?: boolean
  hideRecovery?: boolean
}) {
  const layoutBalance = useCognitiveUI((s) => s.policy.layoutBalance)
  const spring = {
    type: 'spring' as const,
    stiffness: 520 - layoutBalance * 88,
    damping: 44,
  }

  return (
    <div
      className="grid grid-cols-2"
      style={{
        gap: compact
          ? 'calc(var(--cognitive-grid-gap, 12px) * 0.78 * (1 - var(--layout-balance, 0.26) * 0.09))'
          : 'calc(var(--cognitive-grid-gap, 12px) * (1 - var(--layout-balance, 0.26) * 0.07))',
      }}
    >
      <Widget
        icon={<History size={16} className="text-gold-400" />}
        label="Ближайшая"
        value={widgets.nextTime ?? '—'}
        compact={compact}
        motionSpring={spring}
      />
      <Widget
        icon={<Gauge size={16} className="text-gold-400" />}
        label="Нагрузка"
        value={widgets.loadLevel === 'high' ? 'Высокая' : widgets.loadLevel === 'medium' ? 'Средняя' : 'Низкая'}
        compact={compact}
        motionSpring={spring}
      />
      <Widget
        icon={<CreditCard size={16} className="text-gold-400" />}
        label="Доход"
        value={`${money(widgets.incomeToday)} ₽`}
        compact={compact}
        motionSpring={spring}
        colSpanFull={hideRecovery}
        rebalanceFill={hideRecovery}
      />
      {hideRecovery ? null : (
        <Widget
          icon={<Sparkles size={16} className="text-gold-400" />}
          label="Recovery"
          value={widgets.recoveryCount ? `${widgets.recoveryCount} клиента` : 'Спокойно'}
          compact={compact}
          motionSpring={spring}
        />
      )}
    </div>
  )
}

function Widget({
  icon,
  label,
  value,
  compact,
  motionSpring,
  colSpanFull = false,
  rebalanceFill = false,
}: {
  icon: ReactNode
  label: string
  value: string
  compact: boolean
  motionSpring: { type: 'spring'; stiffness: number; damping: number }
  colSpanFull?: boolean
  rebalanceFill?: boolean
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionSpring}
      className={cn(
        'rounded-3xl border px-4 py-3 shadow-soft',
        'ring-1 ring-black/5',
        compact && 'px-3 py-2',
        colSpanFull && 'col-span-2',
        rebalanceFill && (compact ? 'min-h-[80px]' : 'min-h-[92px]'),
      )}
      style={{
        backdropFilter: glassBackdropFilter('interactive'),
        backgroundColor: glassFill('interactive'),
        borderColor: glassBorderStyle('interactive'),
        paddingBlock: rebalanceFill
          ? 'calc(0.85rem + (1 - var(--layout-balance, 0.26)) * 0.35rem)'
          : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
          {icon}
          {label}
        </div>
      </div>
      <div
        className={cn(
          'mt-2 text-[16px] font-semibold tracking-tightish text-ink-950',
          compact && 'mt-1 text-[14px]',
          rebalanceFill && !compact && 'text-[17px]',
        )}
      >
        {value}
      </div>
    </motion.div>
  )
}
