import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { LumiButton } from '../components/ui/LumiButton'
import { LumiInput } from '../components/ui/LumiInput'
import { cn } from '../lib/cn'
import { persistBookingForRemoteWorkspace, persistIntegratedBooking } from '../lib/publicBookingPersistence'
import {
  computeFreeSlots,
  fetchWorkspaceSnapshot,
  parseWorkspaceParam,
  type WorkspaceSnapshot,
} from '../lib/publicWorkspace'
import { useAuthStore } from '../store/authStore'
import { motion as motionTokens } from '../theme/motion'
import { todayISO, useStore, type Booking, type Client, type Master, type Service } from '../state/store'

type Step = 'master' | 'service' | 'schedule' | 'guest' | 'done'

function addDaysISO(iso: string, delta: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function weekdayShort(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: 'short' })
}

function formatRuSummary(dateISO: string, time: string) {
  const [y, m, d] = dateISO.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const datePart = dt.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return `${datePart}, ${time}`
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function normalizePhone(s: string) {
  return s.replace(/[^\d+]/g, '').trim()
}

const calmEase = motionTokens.ease.calm
const slotTransition = { duration: motionTokens.duration.normal, ease: motionTokens.ease.out }

const successVariants = {
  wrap: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.085,
        delayChildren: 0.06,
        duration: motionTokens.duration.normal,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.44, ease: calmEase },
    },
  },
  sparkle: {
    hidden: { opacity: 0, scale: 0.92 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.52, ease: calmEase },
    },
  },
}

export function PublicBooking() {
  const nav = useNavigate()
  const { workspace = 'local' } = useParams<{ workspace: string }>()
  const authUserId = useAuthStore((s) => s.user?.id ?? null)

  const parsed = useMemo(() => parseWorkspaceParam(workspace), [workspace])
  const ownerFromUrl = parsed.kind === 'remote' ? parsed.ownerUserId : null
  const useIntegrated =
    parsed.kind === 'local' || (parsed.kind === 'remote' && authUserId === ownerFromUrl)

  const { state, dispatch, freeSlots } = useStore()

  const [remoteSnap, setRemoteSnap] = useState<WorkspaceSnapshot | null>(null)
  const [remoteLoading, setRemoteLoading] = useState(!useIntegrated && parsed.kind === 'remote')
  const [remoteBookings, setRemoteBookings] = useState<Booking[]>([])
  const [remoteClientsExtra, setRemoteClientsExtra] = useState<Client[]>([])

  useEffect(() => {
    setRemoteClientsExtra([])
  }, [remoteSnap])

  useEffect(() => {
    if (useIntegrated || parsed.kind !== 'remote' || !ownerFromUrl) {
      setRemoteLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setRemoteLoading(true)
      const snap = await fetchWorkspaceSnapshot(ownerFromUrl)
      if (cancelled) return
      if (!snap) {
        setRemoteSnap(null)
        setRemoteBookings([])
      } else {
        setRemoteSnap(snap)
        setRemoteBookings(snap.bookings)
      }
      setRemoteLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [ownerFromUrl, parsed.kind, useIntegrated])

  const masters = useIntegrated ? state.masters : remoteSnap?.masters ?? []
  const services = useIntegrated ? state.services : remoteSnap?.services ?? []
  const bookings = useIntegrated ? state.bookings : remoteBookings
  const baseRemoteClients = remoteSnap?.clients ?? []
  const remoteClientPool = useMemo(() => {
    const map = new Map<string, Client>()
    for (const c of baseRemoteClients) {
      map.set(normalizePhone(c.phone), c)
    }
    for (const c of remoteClientsExtra) {
      map.set(normalizePhone(c.phone), c)
    }
    return Array.from(map.values())
  }, [baseRemoteClients, remoteClientsExtra])

  const [logoOk, setLogoOk] = useState(true)
  const [step, setStep] = useState<Step>('master')

  const [master, setMaster] = useState<Master | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [dateISO, setDateISO] = useState(todayISO())
  const [time, setTime] = useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [doneSummary, setDoneSummary] = useState<{
    serviceName: string
    masterName: string
    summaryLine: string
  } | null>(null)

  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => addDaysISO(todayISO(), i)), [])

  const slots = useMemo(() => {
    if (!master) return []
    return useIntegrated ? freeSlots(dateISO, master.id) : computeFreeSlots(dateISO, master.id, bookings)
  }, [bookings, dateISO, freeSlots, master, useIntegrated])

  const ownerUserIdForPersist = authUserId ?? ownerFromUrl ?? undefined

  const goBack = () => {
    setStep((s) => {
      if (s === 'master') return 'master'
      if (s === 'service') return 'master'
      if (s === 'schedule') return 'service'
      if (s === 'guest') return 'schedule'
      return s
    })
  }

  const canGuest = clientName.trim().length >= 2 && normalizePhone(phone).length >= 7

  const unavailableRemote = !useIntegrated && parsed.kind === 'remote' && !remoteLoading && !remoteSnap

  const resetFlow = () => {
    setStep('master')
    setMaster(null)
    setService(null)
    setDateISO(todayISO())
    setTime(null)
    setClientName('')
    setPhone('')
    setDoneSummary(null)
  }

  return (
    <div
      className="px-5"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 1.75rem)',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
      }}
    >
      <div className="mx-auto max-w-[520px]">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (step === 'master') nav(-1)
              else goBack()
            }}
            className="inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/55 px-3 py-2 text-[13px] font-medium text-ink-800/85 shadow-soft backdrop-blur-glass transition-colors duration-200 hover:bg-white/68 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF] active:scale-[var(--press-scale,0.992)]"
          >
            <ChevronLeft size={18} />
            <span className="text-[13px]">Назад</span>
          </button>
          <div className="text-right">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-700/55">
              Запись
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col items-center" style={{ marginBottom: 26 }}>
          {logoOk ? (
            <img
              src="/lumi-logo-transparent.png"
              alt="LUMI BOOK"
              className="h-auto object-contain"
              style={{ width: 164, maxWidth: '62vw' }}
              draggable={false}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <div className="text-[17px] font-semibold tracking-tightish text-ink-950">LUMI BOOK</div>
          )}
          <p className="mt-4 max-w-[300px] text-center text-[13px] leading-[1.65] text-ink-700/62">
            Несколько тихих шагов — и готово.
          </p>
        </div>

        {remoteLoading ? (
          <div className="rounded-[28px] border border-white/50 bg-white/50 px-6 py-10 text-center text-[14px] text-ink-700/70 shadow-soft backdrop-blur-glass">
            Открываем календарь салона…
          </div>
        ) : unavailableRemote ? (
          <div className="rounded-[28px] border border-white/50 bg-white/50 px-6 py-10 text-center shadow-soft backdrop-blur-glass">
            <div className="text-[16px] font-semibold tracking-tightish text-ink-950">
              Ссылка пока недоступна
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-700/65">
              Попросите мастера обновить адрес записи или попробуйте позже.
            </p>
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/45 bg-white/45 p-7 shadow-soft backdrop-blur-glass">
            <AnimatePresence mode="wait" initial={false}>
              {step === 'master' ? (
                <motion.div
                  key="master"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: motionTokens.duration.slow, ease: calmEase }}
                  className="space-y-5"
                >
                  <h1 className="text-[21px] font-semibold tracking-tight text-ink-950">
                    Выберите мастера
                  </h1>
                  <div className="space-y-3">
                    {masters.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMaster(m)
                          setStep('service')
                        }}
                        className={cn(
                          'flex min-h-[54px] w-full touch-manipulation items-center justify-between gap-4 rounded-[22px] px-5 py-4 text-left transition-colors duration-200',
                          'border border-white/55 bg-white/55 shadow-soft hover:bg-white/65 active:bg-white/72',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]',
                          'active:scale-[var(--press-scale,0.992)]',
                        )}
                      >
                        <span className="text-[15px] font-semibold tracking-tight text-ink-950">
                          {m.name}
                        </span>
                        <span
                          className={cn(
                            'h-2 w-2 shrink-0 rounded-full',
                            m.color === 'gold' ? 'bg-gold-400/75' : 'bg-ink-400/55',
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}

              {step === 'service' ? (
                <motion.div
                  key="service"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: motionTokens.duration.slow, ease: calmEase }}
                  className="space-y-5"
                >
                  <h1 className="text-[21px] font-semibold tracking-tight text-ink-950">Услуга</h1>
                  <div className="space-y-3">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setService(s)
                          setStep('schedule')
                        }}
                        className={cn(
                          'min-h-[54px] w-full touch-manipulation rounded-[22px] border border-white/55 bg-white/55 px-5 py-4 text-left shadow-soft transition-colors duration-200 hover:bg-white/65 active:bg-white/72',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]',
                          'active:scale-[var(--press-scale,0.992)]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[15px] font-semibold tracking-tight text-ink-950">
                              {s.name}
                            </div>
                            <div className="mt-1 text-[12px] text-ink-700/55">{s.minutes} минут</div>
                          </div>
                          <div className="text-[14px] font-semibold text-ink-950">{s.price} ₽</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}

              {step === 'schedule' ? (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: motionTokens.duration.slow, ease: calmEase }}
                  className="space-y-6"
                >
                  <h1 className="text-[21px] font-semibold tracking-tight text-ink-950">
                    Дата и время
                  </h1>

                  <div className="flex gap-2.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                    {days.map((d) => {
                      const active = d === dateISO
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDateISO(d)
                            setTime(null)
                          }}
                          className={cn(
                            'min-h-[54px] min-w-[136px] shrink-0 touch-manipulation rounded-[20px] border px-4 py-3 text-left transition-all duration-200',
                            active
                              ? 'border-gold-300/50 bg-white/80 shadow-soft'
                              : 'border-white/50 bg-white/48 shadow-soft hover:bg-white/58',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]',
                            'active:scale-[var(--press-scale,0.992)]',
                          )}
                        >
                          <div className="text-[11px] font-medium uppercase tracking-wide text-ink-700/55">
                            {weekdayShort(d)}
                          </div>
                          <div className="mt-1 text-[14px] font-semibold text-ink-950">
                            {active ? 'Выбрано' : 'Выбрать'}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div>
                    <div className="text-[12px] font-medium tracking-tight text-ink-700/55">
                      Свободные окна
                    </div>
                    {slots.length ? (
                      <LayoutGroup id={`slots-${dateISO}-${master?.id ?? ''}`}>
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          <AnimatePresence mode="popLayout">
                            {slots.map((t) => {
                              const active = time === t
                              return (
                                <motion.button
                                  key={t}
                                  layout
                                  type="button"
                                  initial={{ opacity: 0, scale: 0.94 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={slotTransition}
                                  whileTap={{ scale: active ? 0.98 : 0.96 }}
                                  onClick={() => setTime(t)}
                                  className={cn(
                                    'min-h-[48px] min-w-[78px] touch-manipulation rounded-full px-4 text-[14px] font-semibold tracking-tight transition-colors duration-200',
                                    active
                                      ? 'bg-ink-950 text-paper-50 shadow-[0_10px_32px_rgba(26,24,20,0.12)] ring-2 ring-gold-300/42 ring-offset-2 ring-offset-[#FAF7EF]/90'
                                      : 'border border-white/55 bg-white/54 text-ink-950 shadow-soft hover:bg-white/72',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF]',
                                  )}
                                >
                                  {t}
                                </motion.button>
                              )
                            })}
                          </AnimatePresence>
                        </div>
                      </LayoutGroup>
                    ) : (
                      <p className="mt-3 text-[13px] leading-relaxed text-ink-700/65">
                        На этот день свободных окон пока нет.
                      </p>
                    )}
                  </div>

                  <LumiButton disabled={!time} onClick={() => setStep('guest')}>
                    Дальше
                  </LumiButton>
                </motion.div>
              ) : null}

              {step === 'guest' ? (
                <motion.div
                  key="guest"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: motionTokens.duration.slow, ease: calmEase }}
                  className="space-y-5"
                >
                  <h1 className="text-[21px] font-semibold tracking-tight text-ink-950">
                    Как к вам обращаться
                  </h1>
                  <LumiInput
                    label="Имя"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Например, Мария"
                    autoComplete="name"
                  />
                  <LumiInput
                    label="Телефон"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 ___ ___‑__‑__"
                  />
                  <LumiButton
                    disabled={!canGuest || !master || !service || !time}
                    onClick={() => {
                      if (!master || !service || !time) return
                      const now = Date.now()
                      const cleanPhone = normalizePhone(phone)
                      const name = clientName.trim()

                      const clientList: Client[] = useIntegrated ? state.clients : remoteClientPool

                      const existing = clientList.find((c) => normalizePhone(c.phone) === cleanPhone)
                      const client: Client = existing
                        ? {
                            ...existing,
                            name,
                            userId: ownerUserIdForPersist ?? existing.userId,
                          }
                        : {
                            id: uid('c'),
                            name,
                            phone: cleanPhone,
                            notes: undefined,
                            totalSpent: 0,
                            visits: 0,
                            userId: ownerUserIdForPersist,
                          }

                      const bid = uid('b')
                      const bookingDraft: Booking = {
                        id: bid,
                        userId: ownerUserIdForPersist,
                        clientId: client.id,
                        masterId: master.id,
                        serviceId: service.id,
                        clientName: client.name,
                        clientPhone: client.phone,
                        masterName: master.name,
                        serviceName: service.name,
                        serviceMinutes: service.minutes,
                        dateISO,
                        time,
                        price: service.price,
                        status: 'pending_confirm',
                        createdAt: now,
                      }

                      if (useIntegrated) {
                        dispatch({ type: 'upsertClient', client })
                        dispatch({
                          type: 'createBooking',
                          booking: {
                            id: bid,
                            userId: ownerUserIdForPersist,
                            clientId: client.id,
                            masterId: master.id,
                            serviceId: service.id,
                            dateISO,
                            time,
                            price: service.price,
                            status: 'pending_confirm',
                            createdAt: now,
                          },
                        })
                        void persistIntegratedBooking(client, bookingDraft)
                      } else if (ownerFromUrl) {
                        setRemoteBookings((prev) => [bookingDraft, ...prev])
                        setRemoteClientsExtra((prev) => {
                          const next = prev.filter((c) => normalizePhone(c.phone) !== cleanPhone)
                          return [client, ...next]
                        })
                        void persistBookingForRemoteWorkspace({
                          ownerUserId: ownerFromUrl,
                          booking: bookingDraft,
                          client,
                        })
                      }

                      setDoneSummary({
                        serviceName: service.name,
                        masterName: master.name,
                        summaryLine: formatRuSummary(dateISO, time),
                      })
                      setStep('done')
                    }}
                  >
                    Записаться
                  </LumiButton>
                </motion.div>
              ) : null}

              {step === 'done' && doneSummary ? (
                <motion.div
                  key="done"
                  variants={successVariants.wrap}
                  initial="hidden"
                  animate="show"
                  className="space-y-8 pb-1 text-center"
                >
                  <motion.div
                    variants={successVariants.sparkle}
                    className="mx-auto inline-flex rounded-full border border-gold-200/38 bg-white/72 px-5 py-2 text-[12px] font-medium tracking-wide text-ink-800/78 shadow-soft"
                  >
                    Вы записаны ✨
                  </motion.div>
                  <motion.div variants={successVariants.item} className="space-y-2">
                    <div className="text-[19px] font-semibold tracking-tight text-ink-950">
                      {doneSummary.serviceName}
                    </div>
                    <div className="text-[14px] text-ink-700/68">{doneSummary.masterName}</div>
                    <div className="text-[14px] font-medium leading-snug text-ink-800/82">
                      {doneSummary.summaryLine}
                    </div>
                  </motion.div>
                  <motion.p
                    variants={successVariants.item}
                    className="mx-auto max-w-[308px] text-[13px] leading-[1.65] text-ink-700/55"
                  >
                    Мастер свяжется с вами, чтобы спокойно подтвердить время.
                  </motion.p>
                  <motion.div variants={successVariants.item}>
                    <LumiButton variant="secondary" onClick={resetFlow}>
                      Новая запись
                    </LumiButton>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
