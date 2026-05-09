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
  void layoutBalance

  return (
    <div
      className="grid grid-cols-2"
      style={{
        gap: 18,
      }}
    >
      <Widget
        icon={<History size={18} className="text-gold-400" strokeWidth={2} />}
        label="Ближайшая"
        value={widgets.nextTime ?? '—'}
        compact={compact}
      />
      <Widget
        icon={<Gauge size={18} className="text-gold-400" strokeWidth={2} />}
        label="Нагрузка"
        value={widgets.loadLevel === 'high' ? 'Высокая' : widgets.loadLevel === 'medium' ? 'Средняя' : 'Низкая'}
        compact={compact}
      />
      <Widget
        icon={<CreditCard size={18} className="text-gold-400" strokeWidth={2} />}
        label="Доход"
        value={`${money(widgets.incomeToday)} ₽`}
        compact={compact}
        colSpanFull={hideRecovery}
        rebalanceFill={hideRecovery}
      />
      {hideRecovery ? null : (
        <Widget
          icon={<Sparkles size={18} className="text-gold-400" strokeWidth={2} />}
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
        'rounded-3xl border-[1.5px] border-gold-400/30 px-4 py-4 shadow-luxury',
        'border-l-[3px] border-l-gold-400',
        compact && 'px-3 py-3',
        colSpanFull && 'col-span-2',
        rebalanceFill && (compact ? 'min-h-[84px]' : 'min-h-[96px]'),
      )}
      style={{
        backgroundColor: 'var(--lumi-surface)',
        paddingBlock: rebalanceFill
          ? 'calc(0.9rem + (1 - var(--layout-balance, 0.26)) * 0.35rem)'
          : undefined,
      }}
    >
      <div className="flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-400/50 bg-[var(--lumi-bg)] shadow-soft"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold tracking-tight text-ink-800/72">{label}</div>
          <div
            className={cn(
              'mt-1.5 text-[18px] font-semibold tracking-tight text-ink-950',
              compact && 'text-[16px]',
              rebalanceFill && !compact && 'text-[19px]',
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
