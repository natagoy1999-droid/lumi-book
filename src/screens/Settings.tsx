import { motion } from 'framer-motion'
import {
  Bell,
  Clock,
  CreditCard,
  Plus,
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard'
import { cn } from '../lib/cn'
import { Sheet } from '../components/Sheet'
import { useStore, type AppSettings, type Master, type Service } from '../state/store'
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

  const [openWorkHours, setOpenWorkHours] = useState(false)
  const [openMasters, setOpenMasters] = useState(false)
  const [openServices, setOpenServices] = useState(false)
  const [openChannels, setOpenChannels] = useState(false)
  const [openReminders, setOpenReminders] = useState(false)
  const [openTemplates, setOpenTemplates] = useState(false)
  const [openPayments, setOpenPayments] = useState(false)
  const [openDemo, setOpenDemo] = useState(false)
  const [openDemoData, setOpenDemoData] = useState(false)

  const [masterEdit, setMasterEdit] = useState<Master | null>(null)
  const [serviceEdit, setServiceEdit] = useState<Service | null>(null)

  const [settingsDraft, setSettingsDraft] = useState<AppSettings>(() => state.settings)

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
    <div className="px-5 pt-7">
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
          <GlassCard
            className="p-5"
            onClick={() => {
              setOpenDemo(true)
            }}
          >
            <div className="text-[12px] font-medium text-ink-700/70">Демо</div>
            <div className="mt-2 text-[14px] font-semibold tracking-tightish text-ink-950">
              Guided walkthrough • 60–90 секунд
            </div>
            <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
              Публичная демонстрация: запись → перенос → напоминание → ассистент → деньги → follow-up.
            </div>
            <div className="mt-2 text-[11px] text-ink-700/45">Нажмите, чтобы открыть</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                startDemo()
              }}
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
                      if (it.label === 'Рабочие часы') {
                        setSettingsDraft(state.settings)
                        setOpenWorkHours(true)
                      }
                      if (it.label === 'Мастера') setOpenMasters(true)
                      if (it.label === 'Услуги и цены') setOpenServices(true)
                      if (it.label === 'SMS / WhatsApp / Max') {
                        setSettingsDraft(state.settings)
                        setOpenChannels(true)
                      }
                      if (it.label === 'Напоминания') {
                        setSettingsDraft(state.settings)
                        setOpenReminders(true)
                      }
                      if (it.label === 'Шаблоны сообщений') {
                        setSettingsDraft(state.settings)
                        setOpenTemplates(true)
                      }
                      if (it.label === 'Прайс и предоплата') {
                        setSettingsDraft(state.settings)
                        setOpenPayments(true)
                      }
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

          <GlassCard
            className="p-5"
            onClick={() => {
              setOpenDemoData(true)
            }}
          >
            <div className="text-[12px] font-medium text-ink-700/70">Демо-данные</div>
            <div className="mt-1 text-[11px] text-ink-700/45">Нажмите, чтобы открыть</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch({ type: 'seedDemoData' })
                }}
                className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
              >
                Seed demo
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch({ type: 'resetAllData' })
                }}
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

      <Sheet open={openWorkHours} title="Рабочие часы" onClose={() => setOpenWorkHours(false)} className="pb-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-ink-700/70">Начало</div>
              <input
                value={settingsDraft.workHours.start}
                onChange={(e) =>
                  setSettingsDraft((s) => ({
                    ...s,
                    workHours: { ...s.workHours, start: e.target.value },
                  }))
                }
                placeholder="10:00"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-ink-700/70">Конец</div>
              <input
                value={settingsDraft.workHours.end}
                onChange={(e) =>
                  setSettingsDraft((s) => ({
                    ...s,
                    workHours: { ...s.workHours, end: e.target.value },
                  }))
                }
                placeholder="20:00"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-ink-700/70">Выходные дни</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 1, label: 'Пн' },
                { id: 2, label: 'Вт' },
                { id: 3, label: 'Ср' },
                { id: 4, label: 'Чт' },
                { id: 5, label: 'Пт' },
                { id: 6, label: 'Сб' },
                { id: 0, label: 'Вс' },
              ].map((d) => {
                const active = settingsDraft.workHours.weekendDays.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSettingsDraft((s) => {
                        const has = s.workHours.weekendDays.includes(d.id)
                        const weekendDays = has
                          ? s.workHours.weekendDays.filter((x) => x !== d.id)
                          : [...s.workHours.weekendDays, d.id]
                        return { ...s, workHours: { ...s.workHours, weekendDays } }
                      })
                    }}
                    className={cn(
                      'rounded-3xl border px-3 py-3 text-[13px] font-semibold shadow-soft',
                      active ? 'border-white/70 bg-white/75 text-ink-950' : 'border-white/55 bg-white/55 text-ink-700/75',
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { workHours: settingsDraft.workHours } })
                setOpenWorkHours(false)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setOpenWorkHours(false)}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
            >
              Отмена
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={openMasters} title="Мастера" onClose={() => setOpenMasters(false)}>
        <div className="space-y-2">
          {state.masters.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMasterEdit({ ...m })}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                  {m.name}
                </div>
                <div className="text-[12px] font-medium text-ink-700/65">{m.color}</div>
              </div>
              <div className="mt-1 text-[11px] text-ink-700/45">Нажмите, чтобы изменить</div>
            </button>
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
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceEdit({ ...s })}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                  {s.name}
                </div>
                <div className="text-[12px] font-medium text-ink-700/65">{s.price} ₽</div>
              </div>
              <div className="mt-1 text-[12px] text-ink-700/60">{s.minutes} мин</div>
              <div className="mt-1 text-[11px] text-ink-700/45">Нажмите, чтобы изменить</div>
            </button>
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

      <Sheet
        open={Boolean(masterEdit)}
        title="Редактировать мастера"
        onClose={() => setMasterEdit(null)}
        className="pb-6"
      >
        {masterEdit ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <input
                value={masterEdit.name}
                onChange={(e) => setMasterEdit((s) => (s ? { ...s, name: e.target.value } : s))}
                placeholder="Имя мастера"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMasterEdit((s) => (s ? { ...s, color: 'gold' } : s))}
                  className={cn(
                    'rounded-3xl border px-4 py-3 text-[13px] font-semibold shadow-soft',
                    masterEdit.color === 'gold'
                      ? 'border-white/70 bg-white/75 text-ink-950'
                      : 'border-white/55 bg-white/55 text-ink-700/75',
                  )}
                >
                  Золотой
                </button>
                <button
                  type="button"
                  onClick={() => setMasterEdit((s) => (s ? { ...s, color: 'ink' } : s))}
                  className={cn(
                    'rounded-3xl border px-4 py-3 text-[13px] font-semibold shadow-soft',
                    masterEdit.color === 'ink'
                      ? 'border-white/70 bg-white/75 text-ink-950'
                      : 'border-white/55 bg-white/55 text-ink-700/75',
                  )}
                >
                  Чёрный
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const name = masterEdit.name.trim()
                  if (name.length < 2) return
                  dispatch({ type: 'upsertMaster', master: { ...masterEdit, name } })
                  setMasterEdit(null)
                }}
                className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setMasterEdit(null)}
                className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
              >
                Отмена
              </button>
            </div>

            <button
              type="button"
              disabled={state.masters.length <= 1}
              onClick={() => {
                dispatch({ type: 'deleteMaster', masterId: masterEdit.id })
                setMasterEdit(null)
              }}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-3xl border px-4 py-3 text-[13px] font-semibold shadow-soft',
                state.masters.length <= 1
                  ? 'border-white/60 bg-white/45 text-ink-700/45'
                  : 'border-red-200/70 bg-white/55 text-red-700',
              )}
            >
              <Trash2 size={18} />
              Удалить мастера
            </button>
            {state.masters.length <= 1 ? (
              <div className="text-[12px] leading-5 text-ink-700/55">
                Нельзя удалить последнего мастера — это нужно для календаря и записей.
              </div>
            ) : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet
        open={Boolean(serviceEdit)}
        title="Редактировать услугу"
        onClose={() => setServiceEdit(null)}
        className="pb-6"
      >
        {serviceEdit ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <input
                value={serviceEdit.name}
                onChange={(e) => setServiceEdit((s) => (s ? { ...s, name: e.target.value } : s))}
                placeholder="Название услуги"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={String(serviceEdit.minutes)}
                  onChange={(e) =>
                    setServiceEdit((s) =>
                      s ? { ...s, minutes: Number(e.target.value) || 0 } : s,
                    )
                  }
                  inputMode="numeric"
                  placeholder="Длительность, мин"
                  className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
                />
                <input
                  value={String(serviceEdit.price)}
                  onChange={(e) =>
                    setServiceEdit((s) =>
                      s ? { ...s, price: Number(e.target.value) || 0 } : s,
                    )
                  }
                  inputMode="numeric"
                  placeholder="Цена, ₽"
                  className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const name = serviceEdit.name.trim()
                  if (name.length < 2) return
                  const minutes = Math.max(5, Math.round(serviceEdit.minutes))
                  const price = Math.max(0, Math.round(serviceEdit.price))
                  dispatch({
                    type: 'upsertService',
                    service: { ...serviceEdit, name, minutes, price },
                  })
                  setServiceEdit(null)
                }}
                className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setServiceEdit(null)}
                className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
              >
                Отмена
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'deleteService', serviceId: serviceEdit.id })
                setServiceEdit(null)
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-red-200/70 bg-white/55 px-4 py-3 text-[13px] font-semibold text-red-700 shadow-soft"
            >
              <Trash2 size={18} />
              Удалить услугу
            </button>
            <div className="text-[12px] leading-5 text-ink-700/55">
              Если в старых записях была эта услуга, она продолжит отображаться как “Услуга” без ошибок.
            </div>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={openChannels} title="SMS / WhatsApp / Max" onClose={() => setOpenChannels(false)} className="pb-6">
        <div className="space-y-3">
          <div className="space-y-2">
            {(
              [
                ['sms', 'SMS'],
                ['whatsapp', 'WhatsApp'],
                ['max', 'Max'],
              ] as const
            ).map(([k, label]) => {
              const active = settingsDraft.channels[k]
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() =>
                    setSettingsDraft((s) => ({ ...s, channels: { ...s.channels, [k]: !s.channels[k] } }))
                  }
                  className={cn(
                    'w-full rounded-3xl border px-4 py-3 text-left text-[13px] font-semibold shadow-soft',
                    active ? 'border-white/70 bg-white/75 text-ink-950' : 'border-white/55 bg-white/55 text-ink-700/75',
                  )}
                >
                  {label} {active ? '• включено' : '• выключено'}
                </button>
              )
            })}
          </div>
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-ink-700/70">Канал по умолчанию</div>
            <div className="grid grid-cols-3 gap-2">
              {(['sms', 'whatsapp', 'max'] as const).map((c) => {
                const active = settingsDraft.channels.default === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSettingsDraft((s) => ({ ...s, channels: { ...s.channels, default: c } }))}
                    className={cn(
                      'rounded-3xl border px-3 py-3 text-[13px] font-semibold shadow-soft',
                      active ? 'border-white/70 bg-white/75 text-ink-950' : 'border-white/55 bg-white/55 text-ink-700/75',
                    )}
                  >
                    {c === 'sms' ? 'SMS' : c === 'whatsapp' ? 'WhatsApp' : 'Max'}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { channels: settingsDraft.channels } })
                setOpenChannels(false)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setOpenChannels(false)}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
            >
              Отмена
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={openReminders} title="Напоминания" onClose={() => setOpenReminders(false)} className="pb-6">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSettingsDraft((s) => ({ ...s, reminders: { ...s.reminders, enabled: !s.reminders.enabled } }))}
            className={cn(
              'w-full rounded-3xl border px-4 py-3 text-left text-[13px] font-semibold shadow-soft',
              settingsDraft.reminders.enabled ? 'border-white/70 bg-white/75 text-ink-950' : 'border-white/55 bg-white/55 text-ink-700/75',
            )}
          >
            {settingsDraft.reminders.enabled ? 'Напоминания • включены' : 'Напоминания • выключены'}
          </button>
          <div className="space-y-1">
            <div className="text-[12px] font-medium text-ink-700/70">За сколько часов до записи</div>
            <input
              value={String(settingsDraft.reminders.hoursBefore)}
              onChange={(e) =>
                setSettingsDraft((s) => ({ ...s, reminders: { ...s.reminders, hoursBefore: Number(e.target.value) || 0 } }))
              }
              inputMode="numeric"
              className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
          </div>
          <button
            type="button"
            onClick={() => setSettingsDraft((s) => ({ ...s, reminders: { ...s.reminders, repeat: !s.reminders.repeat } }))}
            className={cn(
              'w-full rounded-3xl border px-4 py-3 text-left text-[13px] font-semibold shadow-soft',
              settingsDraft.reminders.repeat ? 'border-white/70 bg-white/75 text-ink-950' : 'border-white/55 bg-white/55 text-ink-700/75',
            )}
          >
            {settingsDraft.reminders.repeat ? 'Повторное напоминание • включено' : 'Повторное напоминание • выключено'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { reminders: settingsDraft.reminders } })
                setOpenReminders(false)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setOpenReminders(false)}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
            >
              Отмена
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={openTemplates} title="Шаблоны сообщений" onClose={() => setOpenTemplates(false)} className="pb-6">
        <div className="space-y-3">
          {(
            [
              ['confirm', 'Подтверждение записи'],
              ['reschedule', 'Перенос записи'],
              ['reminder', 'Напоминание'],
              ['followup', 'Follow-up'],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="space-y-1">
              <div className="text-[12px] font-medium text-ink-700/70">{label}</div>
              <textarea
                value={settingsDraft.templates[k]}
                onChange={(e) => setSettingsDraft((s) => ({ ...s, templates: { ...s.templates, [k]: e.target.value } }))}
                rows={3}
                className="w-full resize-none rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[13px] leading-5 text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { templates: settingsDraft.templates } })
                setOpenTemplates(false)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setOpenTemplates(false)}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
            >
              Отмена
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={openPayments} title="Прайс и предоплата" onClose={() => setOpenPayments(false)} className="pb-6">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSettingsDraft((s) => ({ ...s, payments: { ...s.payments, prepayEnabled: !s.payments.prepayEnabled } }))}
            className={cn(
              'w-full rounded-3xl border px-4 py-3 text-left text-[13px] font-semibold shadow-soft',
              settingsDraft.payments.prepayEnabled ? 'border-white/70 bg-white/75 text-ink-950' : 'border-white/55 bg-white/55 text-ink-700/75',
            )}
          >
            {settingsDraft.payments.prepayEnabled ? 'Предоплата • включена' : 'Предоплата • выключена'}
          </button>
          <div className="space-y-1">
            <div className="text-[12px] font-medium text-ink-700/70">Размер предоплаты</div>
            <input
              value={String(settingsDraft.payments.prepayAmount)}
              onChange={(e) =>
                setSettingsDraft((s) => ({ ...s, payments: { ...s.payments, prepayAmount: Number(e.target.value) || 0 } }))
              }
              inputMode="numeric"
              placeholder="0"
              className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
          </div>
          <div className="space-y-1">
            <div className="text-[12px] font-medium text-ink-700/70">Комментарий к оплате</div>
            <textarea
              value={settingsDraft.payments.paymentComment}
              onChange={(e) => setSettingsDraft((s) => ({ ...s, payments: { ...s.payments, paymentComment: e.target.value } }))}
              rows={3}
              placeholder="Опционально"
              className="w-full resize-none rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[13px] leading-5 text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { payments: settingsDraft.payments } })
                setOpenPayments(false)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setOpenPayments(false)}
              className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
            >
              Отмена
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={openDemo} title="Демо" onClose={() => setOpenDemo(false)} className="pb-6">
        <div className="space-y-2">
          <div className="text-[12px] leading-5 text-ink-700/65">
            Guided walkthrough • 60–90 секунд. Публичная демонстрация сценариев.
          </div>
          <button
            type="button"
            onClick={() => startDemo()}
            className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold"
          >
            Запустить demo mode
          </button>
          <button
            type="button"
            onClick={() => setOpenDemo(false)}
            className="w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
          >
            Отмена
          </button>
        </div>
      </Sheet>

      <Sheet open={openDemoData} title="Демо-данные" onClose={() => setOpenDemoData(false)} className="pb-6">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'seedDemoData' })}
            className="w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
          >
            Seed demo
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'resetAllData' })}
            className="w-full rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
          >
            Reset data
          </button>
          <button
            type="button"
            onClick={() => setOpenDemoData(false)}
            className="w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
          >
            Отмена
          </button>
        </div>
      </Sheet>
    </div>
  )
}

