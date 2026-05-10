import { motion } from 'framer-motion'
import {
  Bell,
  ChevronRight,
  Clock,
  CreditCard,
  HelpCircle,
  Plus,
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { cn } from '../lib/cn'
import { lumiPrimaryActionSm } from '../lib/lumiActionStyles'
import { LumiButton } from '../components/ui/LumiButton'
import { LumiInput } from '../components/ui/LumiInput'
import { LumiModal } from '../components/ui/LumiModal'
import { LumiEmptyState } from '../components/ui/LumiEmptyState'
import {
  TRIAL_DAYS,
  useStore,
  type AppSettings,
  type Master,
  type Service,
  type SubscriptionState,
} from '../state/store'
import { useDemoMode } from '../state/demoMode'
import { useAuthStore } from '../store/authStore'

function paidPlanTitle(plan: SubscriptionState['plan']) {
  if (plan === 'start') return 'Старт'
  if (plan === 'pro') return 'Профи'
  if (plan === 'studio') return 'Студия'
  if (plan === 'premium_ai') return 'Премиум с ИИ'
  return 'Старт'
}

function tariffLines(sub: SubscriptionState) {
  if (sub.status === 'expired') {
    return {
      primary: 'Подключите тариф',
      secondary: 'Чтобы пользоваться всеми возможностями без ограничений.',
    }
  }
  if (sub.status === 'trial' || sub.plan === 'free') {
    return {
      primary: `${TRIAL_DAYS} дней бесплатно`,
      secondary: 'Знакомство без спешки — подключение оплаты только когда будете готовы.',
    }
  }
  return {
    primary: `Тариф «${paidPlanTitle(sub.plan)}»`,
    secondary: 'Спасибо, что с нами.',
  }
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  workHours: { start: '10:00', end: '20:00', weekendDays: [0] },
  channels: { sms: true, whatsapp: true, max: false, default: 'whatsapp' },
  reminders: { enabled: true, hoursBefore: 24, repeat: false },
  templates: {
    confirm: '',
    reschedule: '',
    reminder: '',
    followup: '',
  },
  payments: { prepayEnabled: false, prepayAmount: 0, paymentComment: '' },
}

function mergeAppSettings(raw: AppSettings | undefined): AppSettings {
  const b = DEFAULT_APP_SETTINGS
  if (!raw || typeof raw !== 'object') return { ...b }
  const wh = raw.workHours
  const ch = raw.channels
  const rm = raw.reminders
  const tm = raw.templates
  const pm = raw.payments
  return {
    workHours: {
      start: typeof wh?.start === 'string' ? wh.start : b.workHours.start,
      end: typeof wh?.end === 'string' ? wh.end : b.workHours.end,
      weekendDays: Array.isArray(wh?.weekendDays)
        ? wh.weekendDays.filter((x) => Number.isFinite(x))
        : [...b.workHours.weekendDays],
    },
    channels: {
      sms: typeof ch?.sms === 'boolean' ? ch.sms : b.channels.sms,
      whatsapp: typeof ch?.whatsapp === 'boolean' ? ch.whatsapp : b.channels.whatsapp,
      max: typeof ch?.max === 'boolean' ? ch.max : b.channels.max,
      default:
        ch?.default === 'sms' || ch?.default === 'whatsapp' || ch?.default === 'max'
          ? ch.default
          : b.channels.default,
    },
    reminders: {
      enabled: typeof rm?.enabled === 'boolean' ? rm.enabled : b.reminders.enabled,
      hoursBefore:
        typeof rm?.hoursBefore === 'number' && Number.isFinite(rm.hoursBefore)
          ? Math.max(0, Math.round(rm.hoursBefore))
          : b.reminders.hoursBefore,
      repeat: typeof rm?.repeat === 'boolean' ? rm.repeat : b.reminders.repeat,
    },
    templates: {
      confirm: typeof tm?.confirm === 'string' ? tm.confirm : b.templates.confirm,
      reschedule: typeof tm?.reschedule === 'string' ? tm.reschedule : b.templates.reschedule,
      reminder: typeof tm?.reminder === 'string' ? tm.reminder : b.templates.reminder,
      followup: typeof tm?.followup === 'string' ? tm.followup : b.templates.followup,
    },
    payments: {
      prepayEnabled: typeof pm?.prepayEnabled === 'boolean' ? pm.prepayEnabled : b.payments.prepayEnabled,
      prepayAmount:
        typeof pm?.prepayAmount === 'number' && Number.isFinite(pm.prepayAmount)
          ? Math.max(0, Math.round(pm.prepayAmount))
          : b.payments.prepayAmount,
      paymentComment: typeof pm?.paymentComment === 'string' ? pm.paymentComment : b.payments.paymentComment,
    },
  }
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-700/45">
      {children}
    </h2>
  )
}

type SettingsRowProps = {
  icon: typeof Clock
  title: string
  subtitle?: string
  onClick: () => void
}

function SettingsRow({ icon: Icon, title, subtitle, onClick }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 px-5 py-4 text-left',
        'transition-[background-color,box-shadow] duration-200 ease-out',
        'hover:bg-white/40 hover:shadow-[inset_0_0_0_1px_rgba(198,165,106,0.16)] active:bg-white/55',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/35 focus-visible:ring-inset',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/50 shadow-sm">
        <Icon size={18} strokeWidth={1.75} className="text-ink-800/70" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium tracking-tight text-ink-950">{title}</div>
        {subtitle ? (
          <div className="mt-0.5 truncate text-[13px] text-ink-700/55">{subtitle}</div>
        ) : null}
      </div>
      <ChevronRight size={18} className="shrink-0 text-ink-700/30" strokeWidth={1.75} />
    </button>
  )
}

export function Settings() {
  const nav = useNavigate()
  const { state, dispatch } = useStore()
  const authMode = useAuthStore((s) => s.mode)
  const authUser = useAuthStore((s) => s.user)
  const mastersCountHint = useMemo(() => `${state.masters.length} мастера`, [state.masters.length])
  const servicesCountHint = useMemo(() => `${state.services.length} услуги`, [state.services.length])

  const [activePanel, setActivePanel] = useState<
    | null
    | 'workHours'
    | 'masters'
    | 'services'
    | 'channels'
    | 'reminders'
    | 'templates'
    | 'payments'
    | 'demoData'
  >(null)

  const [masterEdit, setMasterEdit] = useState<Master | null>(null)
  const [serviceEdit, setServiceEdit] = useState<Service | null>(null)

  const [settingsDraft, setSettingsDraft] = useState<AppSettings>(() => mergeAppSettings(state.settings))

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

  const sub = state.subscription
  const { primary: tariffPrimary, secondary: tariffSecondary } = useMemo(() => tariffLines(sub), [sub])

  const planLimits = useMemo(() => {
    const p = sub.plan
    if (p === 'start') return { masters: 1, clients: 100 }
    if (p === 'pro') return { masters: 3, clients: 500 }
    if (p === 'studio') return { masters: 10, clients: 2000 }
    if (p === 'premium_ai') return { masters: Infinity, clients: Infinity }
    return { masters: 1, clients: 100 }
  }, [sub.plan])

  const softHint = useMemo(() => {
    const tooManyMasters = state.masters.length > planLimits.masters
    const tooManyClients = state.clients.length > planLimits.clients
    if (!tooManyMasters && !tooManyClients) return null
    return `Если нужно больше ${tooManyMasters ? 'мастеров' : 'клиентов'}, загляните в тариф «Профи».`
  }, [planLimits.clients, planLimits.masters, state.clients.length, state.masters.length])

  const workHoursHint = `${state.settings.workHours.start} — ${state.settings.workHours.end}`
  const channelDefaultLabels = { sms: 'SMS', whatsapp: 'WhatsApp', max: 'Max' } as const
  const channelHint = `По умолчанию — ${channelDefaultLabels[state.settings.channels.default]}`
  const remindersHint = state.settings.reminders.enabled
    ? `За ${state.settings.reminders.hoursBefore} ч до визита`
    : 'Выключены'
  const templatesHint = 'Тексты для клиентов'
  const paymentsHint = state.settings.payments.prepayEnabled
    ? `Предоплата ${state.settings.payments.prepayAmount} ₽`
    : 'Без предоплаты'

  const accountEmail =
    authMode === 'auth' ? authUser?.email?.trim() || authUser?.phone?.trim() || null : null

  const openPanel = (
    panel: NonNullable<typeof activePanel>,
    refreshDraft?: boolean,
  ) => {
    if (refreshDraft) setSettingsDraft(mergeAppSettings(state.settings))
    setActivePanel(panel)
  }

  return (
    <div
      className="w-full max-w-[520px] mx-auto px-5 pb-32 overflow-x-hidden box-border"
      style={{
        paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))',
        background: 'rgba(255,0,0,0.04)',
      }}
    >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 44 }}
          className="mb-8"
        >
          <div className="lumi-page-title">Настройки</div>
          <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-ink-700/60">
            Управление аккаунтом и приложением.
          </p>
        </motion.div>

        <div className="min-w-0 space-y-8">
          <section className="min-w-0">
            <SectionLabel>Аккаунт</SectionLabel>
            <GlassCard className="min-w-0 p-6">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/55 shadow-sm">
                  <UserRound size={22} strokeWidth={1.6} className="text-ink-800/65" />
                </div>
                <div className="min-w-0 flex-1">
                  {authMode === 'auth' ? (
                    <>
                      <div className="text-[16px] font-medium tracking-tight text-ink-950">
                        {accountEmail ?? 'Аккаунт'}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-700/55">
                        Вход выполнен. Данные синхронизируются с вашим аккаунтом.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-[16px] font-medium tracking-tight text-ink-950">
                        Аккаунт не подключён
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-700/55">
                        Работает локально на этом устройстве.
                      </p>
                    </>
                  )}
                </div>
              </div>
              {authMode !== 'auth' ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => nav('/login')}
                    className={cn(lumiPrimaryActionSm, '!rounded-full px-5 py-2.5 text-[13px]')}
                  >
                    Войти
                  </button>
                  <button
                    type="button"
                    onClick={() => nav('/signup')}
                    className="rounded-full border border-gold-300/30 bg-white/65 px-5 py-2.5 text-[13px] font-semibold text-ink-950 shadow-soft transition hover:border-gold-300/45 hover:bg-white/80"
                  >
                    Подключить аккаунт
                  </button>
                </div>
              ) : null}
            </GlassCard>
          </section>

          <section className="min-w-0">
            <SectionLabel>Тариф</SectionLabel>
            <GlassCard
              className="min-w-0 cursor-pointer p-6 transition hover:bg-white/25"
              onClick={() => nav('/pricing')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  nav('/pricing')
                }
              }}
            >
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[18px] font-semibold tracking-tight text-ink-950">{tariffPrimary}</div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-700/58">{tariffSecondary}</p>
                  {softHint ? (
                    <p className="mt-4 rounded-2xl bg-white/45 px-4 py-3 text-[12px] leading-snug text-ink-700/65">
                      {softHint}
                    </p>
                  ) : null}
                </div>
                <ChevronRight size={20} className="mt-1 shrink-0 text-ink-700/28" strokeWidth={1.75} />
              </div>
              <div className="mt-6">
                <span className="text-[13px] font-medium text-ink-800/70">Изменить тариф</span>
              </div>
            </GlassCard>
          </section>

          <section className="min-w-0">
            <SectionLabel>Планирование</SectionLabel>
            <GlassCard className={cn('min-w-0 overflow-hidden p-0', 'divide-y divide-white/25')}>
              <SettingsRow
                icon={Clock}
                title="Рабочие часы"
                subtitle={workHoursHint}
                onClick={() => openPanel('workHours', true)}
              />
              <SettingsRow
                icon={Users}
                title="Мастера"
                subtitle={mastersCountHint}
                onClick={() => openPanel('masters')}
              />
              <SettingsRow
                icon={SlidersHorizontal}
                title="Услуги и цены"
                subtitle={servicesCountHint}
                onClick={() => openPanel('services')}
              />
            </GlassCard>
          </section>

          <section className="min-w-0">
            <SectionLabel>Коммуникации</SectionLabel>
            <GlassCard className={cn('min-w-0 overflow-hidden p-0', 'divide-y divide-white/25')}>
              <SettingsRow
                icon={MessageSquare}
                title="SMS, WhatsApp, Max"
                subtitle={channelHint}
                onClick={() => openPanel('channels', true)}
              />
              <SettingsRow
                icon={Bell}
                title="Напоминания"
                subtitle={remindersHint}
                onClick={() => openPanel('reminders', true)}
              />
              <SettingsRow
                icon={Sparkles}
                title="Шаблоны сообщений"
                subtitle={templatesHint}
                onClick={() => openPanel('templates', true)}
              />
              <SettingsRow
                icon={CreditCard}
                title="Прайс и предоплата"
                subtitle={paymentsHint}
                onClick={() => openPanel('payments', true)}
              />
            </GlassCard>
          </section>

          <section className="min-w-0">
            <SectionLabel>Помощь</SectionLabel>
            <GlassCard className="min-w-0 p-6">
              <div className="flex min-w-0 gap-3">
                <HelpCircle size={22} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-800/55" />
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-medium tracking-tight text-ink-950">Быстрое знакомство</div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-700/58">
                    Короткий обзор основных возможностей.
                  </p>
                  <LumiButton
                    type="button"
                    className="mt-5 w-auto"
                    fullWidth={false}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setActivePanel(null)
                      queueMicrotask(() => useDemoMode.getState().startWalkthrough())
                    }}
                  >
                    Открыть обзор
                  </LumiButton>

                  <div className="my-6 border-t border-white/25" />

                  <button
                    type="button"
                    onClick={() => openPanel('demoData')}
                    className="text-left text-[13px] font-medium text-ink-700/65 underline-offset-4 transition hover:text-ink-950 hover:underline"
                  >
                    Данные для примера…
                  </button>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-700/48">
                    Заполнить календарь примерами или вернуть приложение к чистому состоянию.
                  </p>
                </div>
              </div>
            </GlassCard>
          </section>
        </div>

      <LumiModal
        open={activePanel === 'workHours'}
        title="Рабочие часы"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <LumiInput
              label="Начало"
              value={settingsDraft.workHours.start}
              onChange={(e) =>
                setSettingsDraft((s) => ({
                  ...s,
                  workHours: { ...s.workHours, start: e.target.value },
                }))
              }
              placeholder="10:00"
            />
            <LumiInput
              label="Конец"
              value={settingsDraft.workHours.end}
              onChange={(e) =>
                setSettingsDraft((s) => ({
                  ...s,
                  workHours: { ...s.workHours, end: e.target.value },
                }))
              }
              placeholder="20:00"
            />
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
                      'lumi-card px-3 py-3 text-[13px] font-semibold',
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
            <LumiButton
              size="sm"
              fullWidth
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { workHours: settingsDraft.workHours } })
                setActivePanel(null)
              }}
            >
              Сохранить
            </LumiButton>
            <LumiButton variant="secondary" size="sm" fullWidth onClick={() => setActivePanel(null)}>
              Отмена
            </LumiButton>
          </div>
        </div>
      </LumiModal>

      <LumiModal
        open={activePanel === 'masters'}
        title="Мастера"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        <div className="space-y-2">
          {state.masters.length ? (
            state.masters.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMasterEdit({ ...m })}
                className="lumi-card px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                    {m.name}
                  </div>
                  <div className="text-[12px] font-medium text-ink-700/65">{m.color}</div>
                </div>
                <div className="mt-1 text-[11px] text-ink-700/45">Нажмите, чтобы изменить</div>
              </button>
            ))
          ) : (
            <LumiEmptyState
              title="Мастера появятся здесь после добавления."
              desc="Добавьте первого мастера — и можно начинать запись."
            />
          )}
        </div>

        <div className="mt-4 lumi-card p-4">
          <div className="text-[12px] font-medium text-ink-700/70">Добавить мастера</div>
          <div className="mt-2 space-y-2">
            <LumiInput
              value={masterDraft.name}
              onChange={(e) => setMasterDraft((s) => ({ ...s, name: e.target.value }))}
              placeholder="Имя"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMasterDraft((s) => ({ ...s, color: 'gold' }))}
                className={cn(
                  'lumi-card px-4 py-3 text-[13px] font-semibold',
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
                  'lumi-card px-4 py-3 text-[13px] font-semibold',
                  masterDraft.color === 'ink'
                    ? 'border-white/70 bg-white/75 text-ink-950'
                    : 'border-white/55 bg-white/55 text-ink-700/75',
                )}
              >
                Ink
              </button>
            </div>
            <LumiButton
              variant="primary"
              size="sm"
              onClick={() => {
                const name = masterDraft.name.trim()
                if (name.length < 2) return
                dispatch({ type: 'upsertMaster', master: { ...masterDraft, name } })
                setMasterDraft({ id: `m_${uid()}`, name: '', color: 'gold' })
              }}
            >
              <Plus size={18} />
              Добавить
            </LumiButton>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <LumiButton variant="secondary" size="sm" fullWidth onClick={() => setActivePanel(null)}>
            Отмена
          </LumiButton>
        </div>
      </LumiModal>

      <LumiModal
        open={activePanel === 'services'}
        title="Услуги и цены"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        <div className="space-y-2">
          {state.services.length ? (
            state.services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceEdit({ ...s })}
                className="lumi-card px-4 py-3"
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
            ))
          ) : (
            <LumiEmptyState
              title="Добавьте первую услугу, чтобы начать запись."
              desc="Название, длительность и цена — этого достаточно."
            />
          )}
        </div>

        <div className="mt-4 lumi-card p-4">
          <div className="text-[12px] font-medium text-ink-700/70">Добавить услугу</div>
          <div className="mt-2 space-y-2">
            <LumiInput
              value={serviceDraft.name}
              onChange={(e) => setServiceDraft((s) => ({ ...s, name: e.target.value }))}
              placeholder="Название"
            />
            <div className="grid grid-cols-2 gap-2">
              <LumiInput
                value={String(serviceDraft.minutes)}
                onChange={(e) =>
                  setServiceDraft((s) => ({ ...s, minutes: Number(e.target.value) || 0 }))
                }
                inputMode="numeric"
                placeholder="Минут"
              />
              <LumiInput
                value={String(serviceDraft.price)}
                onChange={(e) =>
                  setServiceDraft((s) => ({ ...s, price: Number(e.target.value) || 0 }))
                }
                inputMode="numeric"
                placeholder="Цена"
              />
            </div>
            <LumiButton
              variant="primary"
              size="sm"
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
            >
              <Plus size={18} />
              Добавить
            </LumiButton>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <LumiButton variant="secondary" size="sm" fullWidth onClick={() => setActivePanel(null)}>
            Отмена
          </LumiButton>
        </div>
      </LumiModal>

      <LumiModal
        open={Boolean(masterEdit)}
        title="Редактировать мастера"
        onClose={() => setMasterEdit(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        {masterEdit ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <LumiInput
                value={masterEdit.name}
                onChange={(e) => setMasterEdit((s) => (s ? { ...s, name: e.target.value } : s))}
                placeholder="Имя мастера"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMasterEdit((s) => (s ? { ...s, color: 'gold' } : s))}
                  className={cn(
                    'lumi-card px-4 py-3 text-[13px] font-semibold',
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
                    'lumi-card px-4 py-3 text-[13px] font-semibold',
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
              <LumiButton
                size="sm"
                fullWidth
                onClick={() => {
                  const name = masterEdit.name.trim()
                  if (name.length < 2) return
                  dispatch({ type: 'upsertMaster', master: { ...masterEdit, name } })
                  setMasterEdit(null)
                }}
              >
                Сохранить
              </LumiButton>
              <LumiButton variant="secondary" size="sm" fullWidth onClick={() => setMasterEdit(null)}>
                Отмена
              </LumiButton>
            </div>

            <LumiButton
              variant="destructive"
              size="sm"
              disabled={state.masters.length <= 1}
              onClick={() => {
                dispatch({ type: 'deleteMaster', masterId: masterEdit.id })
                setMasterEdit(null)
              }}
            >
              <Trash2 size={18} />
              Удалить мастера
            </LumiButton>
            {state.masters.length <= 1 ? (
              <div className="text-[12px] leading-5 text-ink-700/55">
                Нельзя удалить последнего мастера — это нужно для календаря и записей.
              </div>
            ) : null}
          </div>
        ) : null}
      </LumiModal>

      <LumiModal
        open={Boolean(serviceEdit)}
        title="Редактировать услугу"
        onClose={() => setServiceEdit(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        {serviceEdit ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <LumiInput
                value={serviceEdit.name}
                onChange={(e) => setServiceEdit((s) => (s ? { ...s, name: e.target.value } : s))}
                placeholder="Название услуги"
              />
              <div className="grid grid-cols-2 gap-2">
                <LumiInput
                  value={String(serviceEdit.minutes)}
                  onChange={(e) =>
                    setServiceEdit((s) =>
                      s ? { ...s, minutes: Number(e.target.value) || 0 } : s,
                    )
                  }
                  inputMode="numeric"
                  placeholder="Длительность, мин"
                />
                <LumiInput
                  value={String(serviceEdit.price)}
                  onChange={(e) =>
                    setServiceEdit((s) =>
                      s ? { ...s, price: Number(e.target.value) || 0 } : s,
                    )
                  }
                  inputMode="numeric"
                  placeholder="Цена, ₽"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <LumiButton
                size="sm"
                fullWidth
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
              >
                Сохранить
              </LumiButton>
              <LumiButton variant="secondary" size="sm" fullWidth onClick={() => setServiceEdit(null)}>
                Отмена
              </LumiButton>
            </div>

            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'deleteService', serviceId: serviceEdit.id })
                setServiceEdit(null)
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-red-200/55 bg-white/55 px-4 py-3 text-[13px] font-semibold text-red-700 shadow-soft"
            >
              <Trash2 size={18} />
              Удалить услугу
            </button>
            <div className="text-[12px] leading-5 text-ink-700/55">
              Если в старых записях была эта услуга, она продолжит отображаться как “Услуга” без ошибок.
            </div>
          </div>
        ) : null}
      </LumiModal>

      <LumiModal
        open={activePanel === 'channels'}
        title="SMS, WhatsApp, Max"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
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
                    'w-full lumi-card px-4 py-3 text-left text-[13px] font-semibold',
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
                      'lumi-card px-3 py-3 text-[13px] font-semibold',
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
                setActivePanel(null)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
            >
              Отмена
            </button>
          </div>
        </div>
      </LumiModal>

      <LumiModal
        open={activePanel === 'reminders'}
        title="Напоминания"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSettingsDraft((s) => ({ ...s, reminders: { ...s.reminders, enabled: !s.reminders.enabled } }))}
            className={cn(
              'w-full lumi-card px-4 py-3 text-left text-[13px] font-semibold',
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
              className="w-full lumi-card bg-white/60 px-4 py-3 text-[14px] text-ink-950 outline-none placeholder:text-ink-700/35"
            />
          </div>
          <button
            type="button"
            onClick={() => setSettingsDraft((s) => ({ ...s, reminders: { ...s.reminders, repeat: !s.reminders.repeat } }))}
            className={cn(
              'w-full lumi-card px-4 py-3 text-left text-[13px] font-semibold',
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
                setActivePanel(null)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
            >
              Отмена
            </button>
          </div>
        </div>
      </LumiModal>

      <LumiModal
        open={activePanel === 'templates'}
        title="Шаблоны сообщений"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        <div className="space-y-3">
          {(
            [
              ['confirm', 'Подтверждение записи'],
              ['reschedule', 'Перенос записи'],
              ['reminder', 'Напоминание'],
              ['followup', 'Сопровождение'],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="space-y-1">
              <div className="text-[12px] font-medium text-ink-700/70">{label}</div>
              <textarea
                value={settingsDraft.templates[k]}
                onChange={(e) => setSettingsDraft((s) => ({ ...s, templates: { ...s.templates, [k]: e.target.value } }))}
                rows={3}
                className="w-full resize-none lumi-card bg-white/60 px-4 py-3 text-[13px] leading-5 text-ink-950 outline-none placeholder:text-ink-700/35"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { templates: settingsDraft.templates } })
                setActivePanel(null)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
            >
              Отмена
            </button>
          </div>
        </div>
      </LumiModal>

      <LumiModal
        open={activePanel === 'payments'}
        title="Прайс и предоплата"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSettingsDraft((s) => ({ ...s, payments: { ...s.payments, prepayEnabled: !s.payments.prepayEnabled } }))}
            className={cn(
              'w-full lumi-card px-4 py-3 text-left text-[13px] font-semibold',
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
              className="w-full lumi-card bg-white/60 px-4 py-3 text-[14px] text-ink-950 outline-none placeholder:text-ink-700/35"
            />
          </div>
          <div className="space-y-1">
            <div className="text-[12px] font-medium text-ink-700/70">Комментарий к оплате</div>
            <textarea
              value={settingsDraft.payments.paymentComment}
              onChange={(e) => setSettingsDraft((s) => ({ ...s, payments: { ...s.payments, paymentComment: e.target.value } }))}
              rows={3}
              placeholder="Опционально"
              className="w-full resize-none lumi-card bg-white/60 px-4 py-3 text-[13px] leading-5 text-ink-950 outline-none placeholder:text-ink-700/35"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'updateSettings', settings: { payments: settingsDraft.payments } })
                setActivePanel(null)
              }}
              className="rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
            >
              Отмена
            </button>
          </div>
        </div>
      </LumiModal>

      <LumiModal
        open={activePanel === 'demoData'}
        title="Данные для примера"
        onClose={() => setActivePanel(null)}
        variant="center"
        surface="solid"
        modalId="settings"
      >
        <div className="space-y-2">
          <div className="text-[12px] leading-[1.55] text-ink-700/65">
            Сброс удалит клиентов, записи и события и вернёт чистый старт. Заполнение подставляет расширенный
            учебный календарь — удобно для знакомства с приложением.
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'seedDemoData' })}
            className="w-full lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
          >
            Заполнить примерами
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'resetAllData' })}
            className="w-full rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
          >
            Сбросить данные
          </button>
          <button
            type="button"
            onClick={() => setActivePanel(null)}
            className="w-full lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
          >
            Отмена
          </button>
        </div>
      </LumiModal>
    </div>
  )
}

