import { CreditCard, Gauge, History, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../lib/cn'
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
  // keep reading policy for density; no motion coupling
  void layoutBalance

  return (
    <div
      className="grid grid-cols-2"
      style={{
        gap: 16,
      }}
    >
      <Widget
        icon={<History size={16} className="text-gold-400" />}
        label="Ближайшая"
        value={widgets.nextTime ?? '—'}
        compact={compact}
      />
      <Widget
        icon={<Gauge size={16} className="text-gold-400" />}
        label="Нагрузка"
        value={widgets.loadLevel === 'high' ? 'Высокая' : widgets.loadLevel === 'medium' ? 'Средняя' : 'Низкая'}
        compact={compact}
      />
      <Widget
        icon={<CreditCard size={16} className="text-gold-400" />}
        label="Доход"
        value={`${money(widgets.incomeToday)} ₽`}
        compact={compact}
        colSpanFull={hideRecovery}
        rebalanceFill={hideRecovery}
      />
      {hideRecovery ? null : (
        <Widget
          icon={<Sparkles size={16} className="text-gold-400" />}
          label="Возврат"
          value={widgets.recoveryCount ? `${widgets.recoveryCount} клиента` : 'Спокойно'}
          compact={compact}
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
  colSpanFull = false,
  rebalanceFill = false,
}: {
  icon: ReactNode
  label: string
  value: string
  compact: boolean
  colSpanFull?: boolean
  rebalanceFill?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border px-4 py-3 shadow-soft',
        'ring-1 ring-black/5',
        compact && 'px-3 py-2',
        colSpanFull && 'col-span-2',
        rebalanceFill && (compact ? 'min-h-[80px]' : 'min-h-[92px]'),
      )}
      style={{
        backgroundColor: '#FFFDF8',
        borderColor: 'rgba(20,20,20,0.08)',
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
    </div>
  )
}
