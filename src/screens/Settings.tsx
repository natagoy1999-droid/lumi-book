import { motion } from 'framer-motion'
import {
  Bell,
  Clock,
  CreditCard,
  Plus,
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard'
import { cn } from '../lib/cn'
import { Sheet } from '../components/Sheet'
import { useStore, type Master, type Service } from '../state/store'
import { useDemoMode } from '../state/demoMode'

const groups = [
  {
    title: 'Планирование',
    items: [
      { icon: Clock, label: 'Рабочие часы', hint: '10:00 — 20:00' },
      { icon: Users, label: 'Мастера', hint: '2 мастера' },
      { icon: SlidersHorizontal, label: 'Услуги и цены', hint: '3 услуги' },
    ],
  },
  {
    title: 'Коммуникации',
    items: [
      { icon: MessageSquare, label: 'SMS / WhatsApp / Max', hint: 'подключено демо' },
      { icon: Bell, label: 'Напоминания', hint: 'мягко и по делу' },
      { icon: Sparkles, label: 'Шаблоны сообщений', hint: 'премиальные тексты' },
    ],
  },
  {
    title: 'Оплата',
    items: [{ icon: CreditCard, label: 'Прайс и предоплата', hint: 'опционально' }],
  },
] as const

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function Settings() {
  const { state, dispatch } = useStore()
  const startDemo = useDemoMode((s) => s.start)
  const mastersCountHint = useMemo(() => `${state.masters.length} мастера`, [state.masters.length])
  const servicesCountHint = useMemo(() => `${state.services.length} услуги`, [state.services.length])

  const [openMasters, setOpenMasters] = useState(false)
  const [openServices, setOpenServices] = useState(false)

  const [masterDraft, setMasterDraft] = useState<Master>(() => ({
    id: `m_${uid()}`,
    name: '',
    color: 'gold',
  }))
  const [serviceDraft, setServiceDraft] = useState<Service>(() => ({
    id: `s_${uid()}`,
    name: '',
    minutes: 60,
    price: 2000,
  }))

  return (
    <div className="px-5 pt-7 pb-28">
      <div className="mx-auto max-w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 44 }}
          className="mb-4"
        >
          <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">
            Настройки
          </div>
          <div className="mt-1 text-[28px] font-semibold tracking-tightish text-ink-950">
            Очень просто
          </div>
        </motion.div>

        <div className="space-y-3">
          <GlassCard className="p-5">
            <div className="text-[12px] font-medium text-ink-700/70">Демо</div>
            <div className="mt-2 text-[14px] font-semibold tracking-tightish text-ink-950">
              Guided walkthrough • 60–90 секунд
            </div>
            <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
              Публичная демонстрация: запись → перенос → напоминание → ассистент → деньги → follow-up.
            </div>
            <button
              type="button"
              onClick={() => startDemo()}
              className="mt-4 w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold"
            >
              Запустить demo mode
            </button>
          </GlassCard>

          {groups.map((g) => (
            <GlassCard key={g.title} className="p-5">
              <div className="text-[12px] font-medium text-ink-700/70">{g.title}</div>
              <div className="mt-4 space-y-2">
                {g.items.map((it) => (
                  <button
                    key={it.label}
                    type="button"
                    onClick={() => {
                      if (it.label === 'Мастера') setOpenMasters(true)
                      if (it.label === 'Услуги и цены') setOpenServices(true)
                    }}
                    className={cn(
                      'w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-left shadow-soft',
                      'transition hover:bg-white/65',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 shadow-soft">
                          <it.icon size={18} className="text-ink-800/75" />
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                            {it.label}
                          </div>
                          <div className="mt-0.5 text-[12px] text-ink-700/60">
                            {it.label === 'Мастера'
                              ? mastersCountHint
                              : it.label === 'Услуги и цены'
                                ? servicesCountHint
                                : it.hint}
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-gold-300/60 shadow-glowGold" />
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          ))}

          <GlassCard className="p-5">
            <div className="text-[12px] font-medium text-ink-700/70">Демо-данные</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: 'seedDemoData' })}
                className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
              >
                Seed demo
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'resetAllData' })}
                className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
              >
                Reset
              </button>
            </div>
            <div className="mt-2 text-[12px] leading-5 text-ink-700/60">
              Reset очищает клиентов/записи/события, seed возвращает базовый демо-набор мастеров и услуг.
            </div>
          </GlassCard>
        </div>
      </div>

      <Sheet open={openMasters} title="Мастера" onClose={() => setOpenMasters(false)}>
        <div className="space-y-2">
          {state.masters.map((m) => (
            <div
              key={m.id}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                  {m.name}
                </div>
                <div className="text-[12px] font-medium text-ink-700/65">{m.color}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-white/60 bg-white/55 p-4 shadow-soft">
          <div className="text-[12px] font-medium text-ink-700/70">Добавить мастера</div>
          <div className="mt-2 space-y-2">
            <input
              value={masterDraft.name}
              onChange={(e) => setMasterDraft((s) => ({ ...s, name: e.target.value }))}
              placeholder="Имя"
              className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMasterDraft((s) => ({ ...s, color: 'gold' }))}
                className={cn(
                  'rounded-3xl border px-4 py-3 text-[13px] font-semibold shadow-soft',
                  masterDraft.color === 'gold'
                    ? 'border-white/70 bg-white/75 text-ink-950'
                    : 'border-white/55 bg-white/55 text-ink-700/75',
                )}
              >
                Gold
              </button>
              <button
                type="button"
                onClick={() => setMasterDraft((s) => ({ ...s, color: 'ink' }))}
                className={cn(
                  'rounded-3xl border px-4 py-3 text-[13px] font-semibold shadow-soft',
                  masterDraft.color === 'ink'
                    ? 'border-white/70 bg-white/75 text-ink-950'
                    : 'border-white/55 bg-white/55 text-ink-700/75',
                )}
              >
                Ink
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const name = masterDraft.name.trim()
                if (name.length < 2) return
                dispatch({ type: 'upsertMaster', master: { ...masterDraft, name } })
                setMasterDraft({ id: `m_${uid()}`, name: '', color: 'gold' })
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              <Plus size={18} />
              Добавить
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={openServices} title="Услуги и цены" onClose={() => setOpenServices(false)}>
        <div className="space-y-2">
          {state.services.map((s) => (
            <div
              key={s.id}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                  {s.name}
                </div>
                <div className="text-[12px] font-medium text-ink-700/65">{s.price} ₽</div>
              </div>
              <div className="mt-1 text-[12px] text-ink-700/60">{s.minutes} мин</div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-white/60 bg-white/55 p-4 shadow-soft">
          <div className="text-[12px] font-medium text-ink-700/70">Добавить услугу</div>
          <div className="mt-2 space-y-2">
            <input
              value={serviceDraft.name}
              onChange={(e) => setServiceDraft((s) => ({ ...s, name: e.target.value }))}
              placeholder="Название"
              className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={String(serviceDraft.minutes)}
                onChange={(e) =>
                  setServiceDraft((s) => ({ ...s, minutes: Number(e.target.value) || 0 }))
                }
                inputMode="numeric"
                placeholder="Минут"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
              <input
                value={String(serviceDraft.price)}
                onChange={(e) =>
                  setServiceDraft((s) => ({ ...s, price: Number(e.target.value) || 0 }))
                }
                inputMode="numeric"
                placeholder="Цена"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const name = serviceDraft.name.trim()
                if (name.length < 2) return
                const minutes = Math.max(5, Math.round(serviceDraft.minutes))
                const price = Math.max(0, Math.round(serviceDraft.price))
                dispatch({
                  type: 'upsertService',
                  service: { ...serviceDraft, name, minutes, price },
                })
                setServiceDraft({ id: `s_${uid()}`, name: '', minutes: 60, price: 2000 })
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              <Plus size={18} />
              Добавить
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

