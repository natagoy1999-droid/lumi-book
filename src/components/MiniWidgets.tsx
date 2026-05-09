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
        gap: 18,
      }}
    >
      <Widget
        icon={<History size={17} className="text-gold-400" strokeWidth={1.75} />}
        label="Ближайшая"
        value={widgets.nextTime ?? '—'}
        compact={compact}
      />
      <Widget
        icon={<Gauge size={17} className="text-gold-400" strokeWidth={1.75} />}
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
          icon={<Sparkles size={17} className="text-gold-400" strokeWidth={1.75} />}
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
        'rounded-3xl border px-4 py-3.5 shadow-luxury',
        compact && 'px-3 py-2.5',
        colSpanFull && 'col-span-2',
        rebalanceFill && (compact ? 'min-h-[80px]' : 'min-h-[92px]'),
      )}
      style={{
        backgroundColor: 'var(--lumi-surface)',
        borderColor: 'var(--lumi-border)',
        paddingBlock: rebalanceFill
          ? 'calc(0.85rem + (1 - var(--layout-balance, 0.26)) * 0.35rem)'
          : undefined,
      }}
    >
      <div className="flex gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-soft"
          style={{
            borderColor: 'var(--lumi-border)',
            backgroundColor: 'var(--lumi-bg)',
          }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink-700/78">{label}</div>
          <div
            className={cn(
              'mt-1.5 text-[17px] font-semibold tracking-tight text-ink-950',
              compact && 'text-[15px]',
              rebalanceFill && !compact && 'text-[18px]',
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
