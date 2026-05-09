import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useRef,
  type PropsWithChildren,
} from 'react'

export type Master = { id: string; name: string; color: 'gold' | 'ink' }
export type Service = { id: string; name: string; minutes: number; price: number }
export type Client = {
  id: string
  /** Future workspace ownership (Supabase) */
  userId?: string
  name: string
  phone: string
  notes?: string
  totalSpent: number
  visits: number
}

export type AppSettings = {
  workHours: {
    start: string
    end: string
    weekendDays: number[]
  }
  channels: {
    sms: boolean
    whatsapp: boolean
    max: boolean
    default: 'sms' | 'whatsapp' | 'max'
  }
  reminders: {
    enabled: boolean
    hoursBefore: number
    repeat: boolean
  }
  templates: {
    confirm: string
    reschedule: string
    reminder: string
    followup: string
  }
  payments: {
    prepayEnabled: boolean
    prepayAmount: number
    paymentComment: string
  }
}
export type BookingStatus =
  | 'draft'
  | 'pending_confirm'
  | 'confirmed'
  | 'reschedule_pending'
  | 'cancelled'
  | 'followup_needed'
export type Booking = {
  id: string
  /** Future workspace ownership (Supabase) */
  userId?: string
  clientId: string
  masterId: string
  serviceId: string
  /** Snapshots for safe display after deletes/renames */
  clientName?: string
  clientPhone?: string
  masterName?: string
  serviceName?: string
  serviceMinutes?: number
  dateISO: string // YYYY-MM-DD
  time: string // HH:MM
  price: number
  status: BookingStatus
  comment?: string
  createdAt: number
  lastNudgedAt?: number
  reschedule?: {
    proposedDateISO: string
    proposedTime: string
    proposedAt: number
  }
}

export type SubscriptionPlan = 'free' | 'start' | 'pro' | 'studio' | 'premium_ai'
export type SubscriptionStatus = 'trial' | 'active' | 'expired'
export type SubscriptionState = {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  trialEndsAt: number | null
  selectedAt: number | null
}

export const TRIAL_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

export type EngagementEvent =
  | {
      id: string
      type: 'booking_cancelled'
      at: number
      bookingId: string
      clientId: string
      masterId: string
      serviceId: string
      dateISO: string
      time: string
    }
  | {
      id: string
      type: 'slot_freed'
      at: number
      masterId: string
      dateISO: string
      time: string
    }

type State = {
  masters: Master[]
  services: Service[]
  clients: Client[]
  bookings: Booking[]
  events: EngagementEvent[]
  onboardingDone: boolean
  settings: AppSettings
  subscription: SubscriptionState
}

type Action =
  | { type: 'finishOnboarding' }
  | { type: 'seedDemoData' }
  | { type: 'resetAllData' }
  | { type: 'createBooking'; booking: Booking }
  | { type: 'confirmBooking'; bookingId: string }
  | {
      type: 'cancelBooking'
      bookingId: string
      at: number
      addFreedSlotEvent?: boolean
    }
  | { type: 'nudgeBooking'; bookingId: string; at: number }
  | {
      type: 'proposeReschedule'
      bookingId: string
      proposedDateISO: string
      proposedTime: string
      at: number
    }
  | { type: 'upsertClient'; client: Client }
  | { type: 'upsertService'; service: Service }
  | { type: 'deleteService'; serviceId: string }
  | { type: 'upsertMaster'; master: Master }
  | { type: 'deleteMaster'; masterId: string }
  | { type: 'deleteClient'; clientId: string }
  | { type: 'updateSettings'; settings: Partial<AppSettings> }
  | { type: 'updateSubscription'; subscription: Partial<SubscriptionState> }

const initialState: State = {
  onboardingDone: false,
  masters: [
    { id: 'm1', name: 'Наталия', color: 'gold' },
    { id: 'm2', name: 'Алина', color: 'ink' },
  ],
  services: [
    { id: 's1', name: 'Маникюр (комби)', minutes: 75, price: 2500 },
    { id: 's2', name: 'Покрытие гель-лак', minutes: 45, price: 1600 },
    { id: 's3', name: 'Брови + коррекция', minutes: 35, price: 1200 },
  ],
  clients: [
    {
      id: 'c1',
      name: 'Мария К.',
      phone: '+7 999 120-43-20',
      totalSpent: 18400,
      visits: 7,
      notes: 'Любит утро. Аллергия на сильные отдушки.',
    },
    {
      id: 'c2',
      name: 'Елена С.',
      phone: '+7 999 776-10-11',
      totalSpent: 9600,
      visits: 4,
      notes: 'Просит писать в WhatsApp.',
    },
  ],
  bookings: [],
  events: [],
  settings: {
    workHours: { start: '10:00', end: '20:00', weekendDays: [0] },
    channels: { sms: true, whatsapp: true, max: false, default: 'whatsapp' },
    reminders: { enabled: true, hoursBefore: 24, repeat: false },
    templates: {
      confirm: 'Здравствуйте! Подтверждаю вашу запись на {date} {time}.',
      reschedule: 'Здравствуйте! Можно ли перенести запись на {date} {time}?',
      reminder: 'Напоминаю о записи завтра в {time}. До встречи.',
      followup: 'Здравствуйте! Если удобно — могу предложить свободное окно на этой неделе.',
    },
    payments: { prepayEnabled: false, prepayAmount: 0, paymentComment: '' },
  },
  subscription: {
    plan: 'free',
    status: 'trial',
    trialEndsAt: Date.now() + TRIAL_DAYS * DAY_MS,
    selectedAt: Date.now(),
  },
}

const STORAGE_KEY = 'lumi_store_v1'

type PersistShape = {
  v: 1
  state: State
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function tpl(v: unknown, fb: string) {
  return typeof v === 'string' ? v : fb
}

function sanitizeMaster(x: unknown): Master | null {
  if (!x || typeof x !== 'object') return null
  const m = x as Partial<Master>
  if (typeof m.id !== 'string' || !m.id.trim()) return null
  if (typeof m.name !== 'string') return null
  const color: Master['color'] = m.color === 'ink' ? 'ink' : 'gold'
  return { id: m.id.trim(), name: m.name.trim() || 'Мастер', color }
}

function sanitizeMasters(raw: unknown): Master[] {
  if (!Array.isArray(raw)) return initialState.masters.map((x) => ({ ...x }))
  const out: Master[] = []
  for (const item of raw) {
    const m = sanitizeMaster(item)
    if (m) out.push(m)
  }
  return out.length >= 1 ? out : initialState.masters.map((x) => ({ ...x }))
}

function sanitizeService(x: unknown): Service | null {
  if (!x || typeof x !== 'object') return null
  const s = x as Partial<Service>
  if (typeof s.id !== 'string' || !s.id.trim()) return null
  if (typeof s.name !== 'string') return null
  const minutes =
    typeof s.minutes === 'number' && Number.isFinite(s.minutes) ? Math.max(1, Math.round(s.minutes)) : 60
  const price =
    typeof s.price === 'number' && Number.isFinite(s.price) ? Math.max(0, Math.round(s.price)) : 0
  return { id: s.id.trim(), name: s.name.trim() || 'Услуга', minutes, price }
}

function sanitizeServices(raw: unknown): Service[] {
  if (!Array.isArray(raw)) return initialState.services.map((x) => ({ ...x }))
  const out: Service[] = []
  for (const item of raw) {
    const s = sanitizeService(item)
    if (s) out.push(s)
  }
  return out.length >= 1 ? out : initialState.services.map((x) => ({ ...x }))
}

function sanitizeClient(x: unknown): Client | null {
  if (!x || typeof x !== 'object') return null
  const c = x as Partial<Client>
  if (typeof c.id !== 'string' || !c.id.trim()) return null
  if (typeof c.name !== 'string') return null
  if (typeof c.phone !== 'string') return null
  const totalSpent =
    typeof c.totalSpent === 'number' && Number.isFinite(c.totalSpent)
      ? Math.max(0, Math.round(c.totalSpent))
      : 0
  const visits =
    typeof c.visits === 'number' && Number.isFinite(c.visits) ? Math.max(0, Math.round(c.visits)) : 0
  return {
    id: c.id.trim(),
    userId: typeof c.userId === 'string' ? c.userId : undefined,
    name: c.name.trim() || 'Клиент',
    phone: c.phone.trim() || '—',
    notes: typeof c.notes === 'string' ? c.notes : undefined,
    totalSpent,
    visits,
  }
}

function sanitizeClients(raw: unknown): Client[] {
  if (!Array.isArray(raw)) return []
  const out: Client[] = []
  for (const item of raw) {
    const c = sanitizeClient(item)
    if (c) out.push(c)
  }
  return out
}

function isBookingStatus(x: unknown): x is BookingStatus {
  return (
    x === 'draft' ||
    x === 'pending_confirm' ||
    x === 'confirmed' ||
    x === 'reschedule_pending' ||
    x === 'cancelled' ||
    x === 'followup_needed'
  )
}

function sanitizeBooking(x: unknown): Booking | null {
  if (!x || typeof x !== 'object') return null
  const b = x as Partial<Booking>
  if (typeof b.id !== 'string' || !b.id.trim()) return null
  if (typeof b.clientId !== 'string') return null
  if (typeof b.masterId !== 'string') return null
  if (typeof b.serviceId !== 'string') return null
  if (typeof b.dateISO !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.dateISO)) return null
  if (typeof b.time !== 'string') return null
  if (!isBookingStatus(b.status)) return null
  const price =
    typeof b.price === 'number' && Number.isFinite(b.price) ? Math.max(0, Math.round(b.price)) : 0
  const createdAt =
    typeof b.createdAt === 'number' && Number.isFinite(b.createdAt) ? b.createdAt : Date.now()

  let reschedule: Booking['reschedule'] = undefined
  const rs = b.reschedule
  if (rs && typeof rs === 'object') {
    const pr = rs as Partial<NonNullable<Booking['reschedule']>>
    if (
      typeof pr.proposedDateISO === 'string' &&
      typeof pr.proposedTime === 'string' &&
      typeof pr.proposedAt === 'number' &&
      Number.isFinite(pr.proposedAt)
    ) {
      reschedule = {
        proposedDateISO: pr.proposedDateISO,
        proposedTime: pr.proposedTime,
        proposedAt: pr.proposedAt,
      }
    }
  }

  return {
    id: b.id.trim(),
    userId: typeof b.userId === 'string' ? b.userId : undefined,
    clientId: b.clientId,
    masterId: b.masterId,
    serviceId: b.serviceId,
    clientName: typeof b.clientName === 'string' ? b.clientName : undefined,
    clientPhone: typeof b.clientPhone === 'string' ? b.clientPhone : undefined,
    masterName: typeof b.masterName === 'string' ? b.masterName : undefined,
    serviceName: typeof b.serviceName === 'string' ? b.serviceName : undefined,
    serviceMinutes:
      typeof b.serviceMinutes === 'number' && Number.isFinite(b.serviceMinutes)
        ? b.serviceMinutes
        : undefined,
    dateISO: b.dateISO,
    time: b.time,
    price,
    status: b.status,
    comment: typeof b.comment === 'string' ? b.comment : undefined,
    createdAt,
    lastNudgedAt:
      typeof b.lastNudgedAt === 'number' && Number.isFinite(b.lastNudgedAt)
        ? b.lastNudgedAt
        : undefined,
    reschedule,
  }
}

function sanitizeBookings(raw: unknown): Booking[] {
  if (!Array.isArray(raw)) return []
  const out: Booking[] = []
  for (const item of raw) {
    const bk = sanitizeBooking(item)
    if (bk) out.push(bk)
  }
  return out
}

function sanitizeEvent(x: unknown): EngagementEvent | null {
  if (!x || typeof x !== 'object') return null
  const e = x as Partial<EngagementEvent>
  if (typeof e.id !== 'string' || !e.id.trim()) return null
  if (typeof e.at !== 'number' || !Number.isFinite(e.at)) return null
  if (e.type === 'booking_cancelled') {
    if (
      typeof e.bookingId !== 'string' ||
      typeof e.clientId !== 'string' ||
      typeof e.masterId !== 'string' ||
      typeof e.serviceId !== 'string' ||
      typeof e.dateISO !== 'string' ||
      typeof e.time !== 'string'
    )
      return null
    return {
      id: e.id.trim(),
      type: 'booking_cancelled',
      at: e.at,
      bookingId: e.bookingId,
      clientId: e.clientId,
      masterId: e.masterId,
      serviceId: e.serviceId,
      dateISO: e.dateISO,
      time: e.time,
    }
  }
  if (e.type === 'slot_freed') {
    if (
      typeof e.masterId !== 'string' ||
      typeof e.dateISO !== 'string' ||
      typeof e.time !== 'string'
    )
      return null
    return {
      id: e.id.trim(),
      type: 'slot_freed',
      at: e.at,
      masterId: e.masterId,
      dateISO: e.dateISO,
      time: e.time,
    }
  }
  return null
}

function sanitizeEvents(raw: unknown): EngagementEvent[] {
  if (!Array.isArray(raw)) return []
  const out: EngagementEvent[] = []
  for (const item of raw) {
    const ev = sanitizeEvent(item)
    if (ev) out.push(ev)
  }
  return out
}

function sanitizeSettingsBlob(rawSettings: unknown, baseSettings: AppSettings): AppSettings {
  if (!rawSettings || typeof rawSettings !== 'object') return baseSettings
  const ss = rawSettings as Partial<AppSettings>
  const hoursBeforeRaw = ss.reminders?.hoursBefore
  const hoursBefore =
    typeof hoursBeforeRaw === 'number' && Number.isFinite(hoursBeforeRaw)
      ? Math.max(0, Math.round(hoursBeforeRaw))
      : baseSettings.reminders.hoursBefore
  const prepayRaw = ss.payments?.prepayAmount
  const prepayAmount =
    typeof prepayRaw === 'number' && Number.isFinite(prepayRaw)
      ? Math.max(0, Math.round(prepayRaw))
      : baseSettings.payments.prepayAmount

  return {
    workHours: {
      start:
        typeof ss.workHours?.start === 'string'
          ? ss.workHours.start
          : baseSettings.workHours.start,
      end:
        typeof ss.workHours?.end === 'string' ? ss.workHours.end : baseSettings.workHours.end,
      weekendDays: Array.isArray(ss.workHours?.weekendDays)
        ? ss.workHours!.weekendDays.filter((x) => Number.isFinite(x))
        : baseSettings.workHours.weekendDays,
    },
    channels: {
      sms: typeof ss.channels?.sms === 'boolean' ? ss.channels.sms : baseSettings.channels.sms,
      whatsapp:
        typeof ss.channels?.whatsapp === 'boolean'
          ? ss.channels.whatsapp
          : baseSettings.channels.whatsapp,
      max: typeof ss.channels?.max === 'boolean' ? ss.channels.max : baseSettings.channels.max,
      default:
        ss.channels?.default === 'sms' ||
        ss.channels?.default === 'whatsapp' ||
        ss.channels?.default === 'max'
          ? ss.channels!.default
          : baseSettings.channels.default,
    },
    reminders: {
      enabled:
        typeof ss.reminders?.enabled === 'boolean'
          ? ss.reminders.enabled
          : baseSettings.reminders.enabled,
      hoursBefore,
      repeat:
        typeof ss.reminders?.repeat === 'boolean'
          ? ss.reminders.repeat
          : baseSettings.reminders.repeat,
    },
    templates: {
      confirm: tpl(ss.templates?.confirm, baseSettings.templates.confirm),
      reschedule: tpl(ss.templates?.reschedule, baseSettings.templates.reschedule),
      reminder: tpl(ss.templates?.reminder, baseSettings.templates.reminder),
      followup: tpl(ss.templates?.followup, baseSettings.templates.followup),
    },
    payments: {
      prepayEnabled:
        typeof ss.payments?.prepayEnabled === 'boolean'
          ? ss.payments.prepayEnabled
          : baseSettings.payments.prepayEnabled,
      prepayAmount,
      paymentComment: tpl(ss.payments?.paymentComment, baseSettings.payments.paymentComment),
    },
  }
}

function sanitizeSubscription(rawSub: unknown, baseSub: SubscriptionState): SubscriptionState {
  if (!rawSub || typeof rawSub !== 'object') return baseSub
  const ss = rawSub as Partial<SubscriptionState>
  const plan: SubscriptionPlan =
    ss.plan === 'free' ||
    ss.plan === 'start' ||
    ss.plan === 'pro' ||
    ss.plan === 'studio' ||
    ss.plan === 'premium_ai'
      ? ss.plan
      : baseSub.plan
  const status: SubscriptionStatus =
    ss.status === 'trial' || ss.status === 'active' || ss.status === 'expired'
      ? ss.status
      : baseSub.status
  const trialEndsAt =
    ss.trialEndsAt == null
      ? null
      : typeof ss.trialEndsAt === 'number' && Number.isFinite(ss.trialEndsAt)
        ? ss.trialEndsAt
        : baseSub.trialEndsAt
  const selectedAt =
    ss.selectedAt == null
      ? null
      : typeof ss.selectedAt === 'number' && Number.isFinite(ss.selectedAt)
        ? ss.selectedAt
        : baseSub.selectedAt

  const now = Date.now()
  const ensuredTrialEndsAt = status === 'trial' ? now + TRIAL_DAYS * DAY_MS : trialEndsAt

  return {
    plan,
    status,
    trialEndsAt: ensuredTrialEndsAt,
    selectedAt,
  }
}

/** Merge persisted slices with defaults instead of discarding the whole blob when one array breaks. */
function sanitizeState(input: unknown): State | null {
  if (!input || typeof input !== 'object') return null
  const s = (input as { state?: unknown }).state
  if (!s || typeof s !== 'object') return null
  const st = s as Partial<State>

  const baseSettings = initialState.settings
  const rawSettings = (st as { settings?: unknown }).settings
  const settings = sanitizeSettingsBlob(rawSettings, baseSettings)
  const subscription = sanitizeSubscription(
    (st as { subscription?: unknown }).subscription,
    initialState.subscription,
  )

  return {
    onboardingDone: Boolean(st.onboardingDone),
    masters: sanitizeMasters(st.masters),
    services: sanitizeServices(st.services),
    clients: sanitizeClients(st.clients),
    bookings: sanitizeBookings(st.bookings),
    events: sanitizeEvents(st.events),
    settings,
    subscription,
  }
}

function loadPersistedState(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = safeParse(raw)
    if (parsed === null && raw.trim().length > 0) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      console.warn('[lumi] Removed corrupted localStorage JSON:', STORAGE_KEY)
      return null
    }
    const obj = parsed as Partial<PersistShape>
    if (!obj || typeof obj !== 'object' || obj.v !== 1) return null
    return sanitizeState(obj)
  } catch (e) {
    console.error('[lumi] loadPersistedState failed', e)
    return null
  }
}

function savePersistedState(state: State) {
  try {
    const payload: PersistShape = { v: 1, state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

function addDaysISO(iso: string, deltaDays: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + deltaDays)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function atLocal(dateISO: string, time: string) {
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

function buildDemoState(nowMs: number): Pick<State, 'masters' | 'services' | 'clients' | 'bookings' | 'events'> {
  const today = todayISO()
  const tomorrow = addDaysISO(today, 1)
  const yesterday = addDaysISO(today, -1)

  const masters: Master[] = [
    { id: 'm1', name: 'Наталия', color: 'gold' },
    { id: 'm2', name: 'Алина', color: 'ink' },
  ]

  const services: Service[] = [
    { id: 's1', name: 'Маникюр + укрепление', minutes: 90, price: 3200 },
    { id: 's2', name: 'Маникюр (комби)', minutes: 75, price: 2700 },
    { id: 's3', name: 'Покрытие гель-лак', minutes: 45, price: 1700 },
    { id: 's4', name: 'Снятие + уход', minutes: 30, price: 900 },
    { id: 's5', name: 'Брови: коррекция + окрашивание', minutes: 45, price: 1600 },
    { id: 's6', name: 'Ламинирование бровей', minutes: 60, price: 2400 },
  ]

  const clientsBase: Array<Omit<Client, 'totalSpent' | 'visits'>> = [
    { id: 'c1', name: 'Мария К.', phone: '+7 999 120-43-20', notes: 'Любит утро. Без резких запахов.' },
    { id: 'c2', name: 'Елена С.', phone: '+7 999 776-10-11', notes: 'Писать в WhatsApp. Обычно отвечает вечером.' },
    { id: 'c3', name: 'Дарья Н.', phone: '+7 999 310-05-44', notes: 'Просит напоминание за день.' },
    { id: 'c4', name: 'Анна П.', phone: '+7 999 408-22-17', notes: 'Часто переносит — бережный тон.' },
    { id: 'c5', name: 'Ольга Р.', phone: '+7 999 907-12-63', notes: 'Любит “окно без спешки”.' },
    { id: 'c6', name: 'Ксения Л.', phone: '+7 999 665-19-02', notes: 'Иногда пропадает на месяц.' },
    { id: 'c7', name: 'Полина Я.', phone: '+7 999 552-60-80', notes: 'Только SMS.' },
    { id: 'c8', name: 'Вероника А.', phone: '+7 999 140-90-10', notes: 'Утверждает быстро, если дать 2 варианта.' },
    { id: 'c9', name: 'Софья М.', phone: '+7 999 720-33-90', notes: 'Давно не была — деликатное сопровождение.' },
    { id: 'c10', name: 'Алина В.', phone: '+7 999 811-45-55', notes: 'Предпочитает короткие сообщения.' },
  ]

  const bookings: Booking[] = []
  const events: EngagementEvent[] = []

  const pushBooking = (b: Omit<Booking, 'createdAt'> & { createdAt?: number }) => {
    bookings.push({
      ...b,
      createdAt: b.createdAt ?? Math.max(0, atLocal(b.dateISO, b.time) - 2 * 60 * 60 * 1000),
    })
  }

  // History (last 12 days) for realism + revenue curve.
  const historyDays = Array.from({ length: 12 }, (_, i) => addDaysISO(today, -i - 2))
  const historyTimes = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00']
  let bid = 1
  for (const d of historyDays) {
    const dayLoad = d.endsWith('05') || d.endsWith('10') ? 2 : 3
    for (let i = 0; i < dayLoad; i++) {
      const t = historyTimes[(i * 2 + (d.endsWith('08') ? 1 : 0)) % historyTimes.length]
      const client = clientsBase[(bid + i) % clientsBase.length]
      const service = services[(bid + i) % services.length]
      const master = masters[(bid + i) % masters.length]
      const cancelled = d.endsWith('06') && i === 1
      pushBooking({
        id: `b_hist_${bid}`,
        clientId: client.id,
        masterId: master.id,
        serviceId: service.id,
        dateISO: d,
        time: t,
        price: service.price,
        status: cancelled ? 'cancelled' : 'confirmed',
        comment: cancelled ? 'Отменила в последний момент' : undefined,
      })
      if (cancelled) {
        events.unshift({
          id: `e_cancel_b_hist_${bid}`,
          type: 'booking_cancelled',
          at: atLocal(d, t) - 60 * 60 * 1000,
          bookingId: `b_hist_${bid}`,
          clientId: client.id,
          masterId: master.id,
          serviceId: service.id,
          dateISO: d,
          time: t,
        })
        events.unshift({
          id: `e_slot_${master.id}_${d}_${t}_hist`,
          type: 'slot_freed',
          at: atLocal(d, t) - 55 * 60 * 1000,
          masterId: master.id,
          dateISO: d,
          time: t,
        })
      }
      bid += 1
    }
  }

  // Yesterday: a follow-up needed (client didn't confirm something).
  pushBooking({
    id: 'b_y_1',
    clientId: 'c10',
    masterId: 'm1',
    serviceId: 's2',
    dateISO: yesterday,
    time: '17:30',
    price: services.find((s) => s.id === 's2')!.price,
    status: 'followup_needed',
    lastNudgedAt: nowMs - 36 * 60 * 60 * 1000,
    comment: 'Ждём ответа по подтверждению',
  })

  // Today: mix confirmed + pending + reschedule pending.
  pushBooking({
    id: 'b_t_1',
    clientId: 'c3',
    masterId: 'm1',
    serviceId: 's1',
    dateISO: today,
    time: '11:30',
    price: services.find((s) => s.id === 's1')!.price,
    status: 'confirmed',
  })
  pushBooking({
    id: 'b_t_2',
    clientId: 'c2',
    masterId: 'm1',
    serviceId: 's3',
    dateISO: today,
    time: '14:30',
    price: services.find((s) => s.id === 's3')!.price,
    status: 'pending_confirm',
    lastNudgedAt: nowMs - 2 * 60 * 60 * 1000,
  })
  pushBooking({
    id: 'b_t_3',
    clientId: 'c4',
    masterId: 'm1',
    serviceId: 's5',
    dateISO: today,
    time: '17:30',
    price: services.find((s) => s.id === 's5')!.price,
    status: 'reschedule_pending',
    reschedule: {
      proposedDateISO: tomorrow,
      proposedTime: '13:00',
      proposedAt: nowMs - 45 * 60 * 1000,
    },
    comment: 'Клиент попросил перенос',
  })

  // Tomorrow: busy schedule (to show “busy tomorrow”).
  for (const t of ['10:00', '11:30', '13:00', '16:00', '17:30']) {
    const idx = t === '13:00' ? 6 : t === '17:30' ? 5 : 0
    const client = clientsBase[(3 + idx) % clientsBase.length]
    const service = services[(2 + idx) % services.length]
    pushBooking({
      id: `b_tm_${t.replace(':', '')}`,
      clientId: client.id,
      masterId: 'm1',
      serviceId: service.id,
      dateISO: tomorrow,
      time: t,
      price: service.price,
      status: 'confirmed',
    })
  }

  // Inactive clients: no bookings in recent history, but present in CRM.
  // We'll include them by ensuring clients list includes everyone; stats will show 0.

  // Build clients with visits/spend derived from bookings.
  const stats = new Map<string, { spent: number; visits: number }>()
  for (const b of bookings) {
    if (b.status === 'draft' || b.status === 'cancelled') continue
    const cur = stats.get(b.clientId) ?? { spent: 0, visits: 0 }
    cur.spent += b.price || 0
    cur.visits += 1
    stats.set(b.clientId, cur)
  }

  const clients: Client[] = clientsBase.map((c) => {
    const s = stats.get(c.id) ?? { spent: 0, visits: 0 }
    // Nudge a couple clients into “inactive but valuable” feel.
    const bonus = c.id === 'c9' ? 7400 : 0
    const visitsBonus = c.id === 'c9' ? 3 : 0
    return {
      ...c,
      totalSpent: s.spent + bonus,
      visits: s.visits + visitsBonus,
    }
  })

  // Sort newest first for home/analytics feel.
  bookings.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

  return { masters, services, clients, bookings, events }
}

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case 'finishOnboarding':
      return { ...state, onboardingDone: true }
    case 'seedDemoData': {
      const demo = buildDemoState(Date.now())
      return {
        onboardingDone: state.onboardingDone,
        ...demo,
        settings: state.settings,
        subscription: state.subscription,
      }
    }
    case 'resetAllData': {
      return {
        onboardingDone: state.onboardingDone,
        masters: initialState.masters.slice(0, 1),
        services: initialState.services,
        clients: [],
        bookings: [],
        events: [],
        settings: state.settings,
        subscription: state.subscription,
      }
    }
    case 'createBooking': {
      const c = state.clients.find((x) => x.id === action.booking.clientId)
      const s = state.services.find((x) => x.id === action.booking.serviceId)
      const m = state.masters.find((x) => x.id === action.booking.masterId)
      const booking: Booking = {
        ...action.booking,
        clientName: action.booking.clientName ?? c?.name,
        clientPhone: action.booking.clientPhone ?? c?.phone,
        serviceName: action.booking.serviceName ?? s?.name,
        serviceMinutes: action.booking.serviceMinutes ?? s?.minutes,
        masterName: action.booking.masterName ?? m?.name,
      }
      return { ...state, bookings: [booking, ...state.bookings] }
    }
    case 'confirmBooking': {
      const bookings = state.bookings.map((b) =>
        b.id === action.bookingId ? { ...b, status: 'confirmed' as const } : b,
      )
      return { ...state, bookings }
    }
    case 'cancelBooking': {
      const target = state.bookings.find((b) => b.id === action.bookingId)
      const bookings = state.bookings.map((b) =>
        b.id === action.bookingId ? { ...b, status: 'cancelled' as const } : b,
      )

      const events = [...state.events]
      if (target) {
        events.unshift({
          id: `e_cancel_${action.bookingId}_${action.at}`,
          type: 'booking_cancelled',
          at: action.at,
          bookingId: target.id,
          clientId: target.clientId,
          masterId: target.masterId,
          serviceId: target.serviceId,
          dateISO: target.dateISO,
          time: target.time,
        })

        if (action.addFreedSlotEvent) {
          events.unshift({
            id: `e_slot_${target.masterId}_${target.dateISO}_${target.time}_${action.at}`,
            type: 'slot_freed',
            at: action.at,
            masterId: target.masterId,
            dateISO: target.dateISO,
            time: target.time,
          })
        }
      }

      return { ...state, bookings, events }
    }
    case 'nudgeBooking': {
      const bookings = state.bookings.map((b) =>
        b.id === action.bookingId ? { ...b, lastNudgedAt: action.at } : b,
      )
      return { ...state, bookings }
    }
    case 'proposeReschedule': {
      const bookings = state.bookings.map((b) =>
        b.id === action.bookingId
          ? {
              ...b,
              status: 'reschedule_pending' as const,
              reschedule: {
                proposedDateISO: action.proposedDateISO,
                proposedTime: action.proposedTime,
                proposedAt: action.at,
              },
            }
          : b,
      )
      return { ...state, bookings }
    }
    case 'upsertClient': {
      const exists = state.clients.some((c) => c.id === action.client.id)
      const clients = exists
        ? state.clients.map((c) => (c.id === action.client.id ? action.client : c))
        : [action.client, ...state.clients]
      return { ...state, clients }
    }
    case 'upsertService': {
      const exists = state.services.some((s) => s.id === action.service.id)
      const services = exists
        ? state.services.map((s) => (s.id === action.service.id ? action.service : s))
        : [action.service, ...state.services]
      return { ...state, services }
    }
    case 'deleteService': {
      const services = state.services.filter((s) => s.id !== action.serviceId)
      return { ...state, services }
    }
    case 'upsertMaster': {
      const exists = state.masters.some((m) => m.id === action.master.id)
      const masters = exists
        ? state.masters.map((m) => (m.id === action.master.id ? action.master : m))
        : [action.master, ...state.masters]
      return { ...state, masters }
    }
    case 'deleteMaster': {
      // Safety: never allow empty masters array (would break many screens).
      if (state.masters.length <= 1) return state
      const masters = state.masters.filter((m) => m.id !== action.masterId)
      return { ...state, masters }
    }
    case 'deleteClient': {
      const clients = state.clients.filter((c) => c.id !== action.clientId)
      return { ...state, clients }
    }
    case 'updateSettings': {
      return { ...state, settings: { ...state.settings, ...action.settings } as AppSettings }
    }
    case 'updateSubscription': {
      return {
        ...state,
        subscription: { ...state.subscription, ...action.subscription } as SubscriptionState,
      }
    }
    default:
      return state
  }
}

const Ctx = createContext<
  | {
      state: State
      dispatch: (action: Action) => void
      getClient: (id: string) => Client | undefined
      getMaster: (id: string) => Master | undefined
      getService: (id: string) => Service | undefined
      moneyForDay: (dateISO: string) => number
      freeSlots: (dateISO: string, masterId: string) => string[]
    }
  | undefined
>(undefined)

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  return `${y}-${m}-${day}`
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reduce, initialState, (base) => loadPersistedState() ?? base)
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      savePersistedState(state)
    }, 180)
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [state])

  const api = useMemo(() => {
    const getClient = (id: string) => state.clients.find((c) => c.id === id)
    const getMaster = (id: string) => state.masters.find((m) => m.id === id)
    const getService = (id: string) => state.services.find((s) => s.id === id)

    const moneyForDay = (dateISO: string) =>
      state.bookings
        .filter(
          (b) => b.dateISO === dateISO && b.status !== 'draft' && b.status !== 'cancelled',
        )
        .reduce((sum, b) => sum + (b.price || 0), 0)

    const freeSlots = (dateISO: string, masterId: string) => {
      const work = [
        '10:00',
        '11:30',
        '13:00',
        '14:30',
        '16:00',
        '17:30',
        '19:00',
      ]
      const taken = new Set(
        state.bookings
          .filter(
            (b) =>
              b.dateISO === dateISO &&
              b.masterId === masterId &&
              b.status !== 'cancelled',
          )
          .map((b) => b.time),
      )
      return work.filter((t) => !taken.has(t))
    }

    return {
      state,
      dispatch,
      getClient,
      getMaster,
      getService,
      moneyForDay,
      freeSlots,
    }
  }, [state])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used within StoreProvider')
  return v
}

