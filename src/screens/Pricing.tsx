import { Check, Crown, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { Sheet } from '../components/Sheet'
import { ROUTE_APP_SETTINGS } from '../lib/appRoutes'
import { cn } from '../lib/cn'
import { TRIAL_DAYS, useStore, type SubscriptionPlan, type SubscriptionStatus } from '../state/store'

function subscriptionStatusRu(s: SubscriptionStatus): string {
  if (s === 'trial') return 'пробный период'
  if (s === 'active') return 'активна'
  return 'истекла'
}

type PlanModel = {
  id: Exclude<SubscriptionPlan, 'free'>
  name: string
  price: string
  desc: string
  features: string[]
  recommended?: boolean
}

const plans: PlanModel[] = [
  {
    id: 'start',
    name: 'Старт',
    price: '990 ₽ / месяц',
    desc: 'Для соло‑мастера',
    features: ['до 1 мастера', 'до 100 клиентов', 'онлайн‑запись', 'календарь', 'базовые напоминания', 'аналитика дня'],
  },
  {
    id: 'pro',
    name: 'Профи',
    price: '1 990 ₽ / месяц',
    desc: 'Для активной работы',
    recommended: true,
    features: [
      'до 3 мастеров',
      'до 500 клиентов',
      'умные напоминания',
      'переносы записей',
      'шаблоны сообщений',
      'аналитика недели/месяца',
      'каналы MAX и SMS (учебный режим)',
    ],
  },
  {
    id: 'studio',
    name: 'Студия',
    price: '3 990 ₽ / месяц',
    desc: 'Для небольшой студии',
    features: [
      'до 10 мастеров',
      'до 2 000 клиентов',
      'роли мастеров',
      'расширенная аналитика',
      'клиентская база',
      'возврат клиентов и сопровождение',
      'приоритетная поддержка',
    ],
  },
  {
    id: 'premium_ai',
    name: 'Премиум с ИИ',
    price: '6 990 ₽ / месяц',
    desc: 'Для студий, где важен ритм и сервис',
    features: [
      'безлимит мастеров',
      'безлимит клиентов',
      'умные подсказки',
      'мягкий возврат клиентов',
      'поддержка сценариев',
      'расширенная аналитика',
      'персональные сценарии',
      'ранний доступ к новым функциям',
    ],
  },
]

function planLabel(p: SubscriptionPlan) {
  if (p === 'free') return 'Пробный период'
  if (p === 'start') return 'Старт'
  if (p === 'pro') return 'Профи'
  if (p === 'studio') return 'Студия'
  return 'Премиум с ИИ'
}

export function Pricing() {
  const nav = useNavigate()
  const { state, dispatch } = useStore()
  const sub = state.subscription
  const [pick, setPick] = useState<PlanModel | null>(null)
  const [success, setSuccess] = useState(false)

  const badge = useMemo(() => {
    if (sub.status !== 'trial') return null
    return `Пробный период: ${TRIAL_DAYS} дней`
  }, [sub.status])

  return (
    <div
      className="lumi-page"
      style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}
    >
      <div className="mx-auto max-w-[520px]">
        <div className="mb-4 space-y-1">
          <div className="lumi-section-title">Тарифы</div>
          <div className="lumi-page-title">Тарифы LUMI BOOK</div>
          <div className="mt-1 lumi-secondary">
            Выберите формат, который подходит вашему ритму работы
          </div>
          {badge ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[12px] font-medium text-ink-800/75 shadow-soft">
              <Sparkles size={16} className="text-gold-400" />
              {badge}
            </div>
          ) : null}
          <div className="mt-3 text-[12px] text-ink-700/55">
            Текущий статус:{' '}
            <span className="font-semibold text-ink-950">{subscriptionStatusRu(sub.status)}</span> •{' '}
            <span className="font-semibold text-ink-950">{planLabel(sub.plan)}</span>
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: 12 }}>
          {plans.map((p) => {
            const active = sub.plan === p.id && sub.status === 'active'
            return (
              <GlassCard
                key={p.id}
                className={cn('p-5', p.recommended && 'ring-1 ring-gold-200/60 shadow-glowGold')}
                style={{ backgroundColor: '#FFFDF8', borderColor: 'rgba(20,20,20,0.08)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
                      {p.recommended ? <Crown size={16} className="text-gold-400" /> : <Sparkles size={16} className="text-gold-400" />}
                      {p.name}
                      {p.recommended ? (
                        <span className="ml-1 rounded-full border border-gold-200/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-ink-800/75">
                          рекомендован
                        </span>
                      ) : null}
                      {active ? (
                        <span className="ml-1 rounded-full border border-white/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-ink-800/75">
                          активен
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-[22px] font-semibold tracking-tightish text-ink-950">{p.price}</div>
                    <div className="mt-1 text-[12px] text-ink-700/65">{p.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPick(p)}
                    className={cn(
                      'rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold',
                      active && 'opacity-80',
                    )}
                  >
                    Выбрать тариф
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-[12px] leading-5 text-ink-700/70">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/60 bg-white/70">
                        <Check size={12} className="text-ink-950" />
                      </div>
                      <div>{f}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => nav(ROUTE_APP_SETTINGS)}
          className="mt-4 w-full lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
        >
          Назад в настройки
        </button>
      </div>

      <Sheet
        open={Boolean(pick)}
        title="Подтверждение"
        onClose={() => setPick(null)}
        variant="center"
        surface="solid"
      >
        {pick ? (
          <div className="space-y-3">
            <div className="lumi-card bg-white/60 p-4 text-[12px] leading-5 text-ink-700/70">
              Вы выбрали <span className="font-semibold text-ink-950">{pick.name}</span> •{' '}
              <span className="font-semibold text-ink-950">{pick.price}</span>
              <div className="mt-2 text-ink-700/65">
                Оплата пока не подключена. Тариф активирован в демо‑режиме.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch({
                    type: 'updateSubscription',
                    subscription: {
                      plan: pick.id,
                      status: 'active',
                      selectedAt: Date.now(),
                    },
                  })
                  setPick(null)
                  setSuccess(true)
                  setTimeout(() => setSuccess(false), 1200)
                }}
                className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
              >
                Активировать тариф
              </button>
              <button
                type="button"
                onClick={() => setPick(null)}
                className="lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : null}
      </Sheet>

      <Sheet
        open={success}
        title="Готово"
        onClose={() => setSuccess(false)}
        variant="center"
        surface="solid"
      >
        <div className="lumi-card bg-white/60 p-4 text-[13px] font-semibold text-ink-950">
          Тариф активирован
        </div>
      </Sheet>
    </div>
  )
}

