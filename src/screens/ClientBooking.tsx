import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BookingMonthCalendar } from '../components/BookingMonthCalendar'
import { GlassCard } from '../components/GlassCard'
import {
  buildClientBookingDateList,
  clampDateToClientBookingWindow,
  isISOInClientBookingWindow,
} from '../lib/clientBookingDateWindow'
import { cn } from '../lib/cn'
import { LumiButton } from '../components/ui/LumiButton'
import { LumiInput } from '../components/ui/LumiInput'
import { todayISO, useStore, type Client, type Master, type Service } from '../state/store'

type Step = 'service' | 'master' | 'date' | 'time' | 'client' | 'confirm' | 'success'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function normalizePhone(s: string) {
  return s.replace(/[^\d+]/g, '').trim()
}

export function ClientBooking() {
  const nav = useNavigate()
  const { state, dispatch, freeSlots } = useStore()

  const [logoOk, setLogoOk] = useState(true)
  const [step, setStep] = useState<Step>('service')

  const [service, setService] = useState<Service | null>(null)
  const [master, setMaster] = useState<Master | null>(null)
  const [dateISO, setDateISO] = useState(todayISO())
  const [time, setTime] = useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')

  const [bookingId, setBookingId] = useState<string | null>(null)

  const bookableDays = useMemo(() => buildClientBookingDateList(todayISO()), [])

  const slots = useMemo(() => {
    if (!master) return []
    return freeSlots(dateISO, master.id)
  }, [dateISO, freeSlots, master])

  const hasAnySlotsInWindow = useMemo(() => {
    if (!master) return false
    return bookableDays.some((d) => freeSlots(d, master.id).length > 0)
  }, [bookableDays, freeSlots, master])

  useEffect(() => {
    if ((step !== 'date' && step !== 'time') || !master) return
    const t = todayISO()
    setDateISO((d) => clampDateToClientBookingWindow(d, t))
  }, [step, master?.id])

  const goBack = () => {
    setStep((s) => {
      if (s === 'service') return 'service'
      if (s === 'master') return 'service'
      if (s === 'date') return 'master'
      if (s === 'time') return 'date'
      if (s === 'client') return 'time'
      if (s === 'confirm') return 'client'
      if (s === 'success') return 'service'
      return s
    })
  }

  const canClient = clientName.trim().length >= 2 && normalizePhone(phone).length >= 7
  const canConfirm = Boolean(service && master && dateISO && time && canClient)

  return (
    <div
      className="px-5"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 1.75rem)',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
      }}
    >
      <div className="mx-auto max-w-[520px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 'service') nav(-1)
              else goBack()
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/55 bg-white/60 px-3 py-2 text-[12px] font-medium text-ink-800/80 shadow-soft backdrop-blur-glass"
          >
            <ChevronLeft size={16} />
            Назад
          </button>
          <div className="text-right">
            <div className="text-[12px] font-medium text-ink-700/70">Онлайн-запись</div>
            <div className="text-[12px] text-ink-700/60">LUMI BOOK</div>
          </div>
        </div>

        <div className="mt-6 flex w-full items-center justify-center" style={{ marginBottom: 18 }}>
          {logoOk ? (
            <img
              src="/lumi-logo-transparent.png"
              alt="LUMI BOOK"
              className="h-auto object-contain"
              style={{ width: 180, maxWidth: '70vw' }}
              draggable={false}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <div className="text-[18px] font-semibold tracking-tightish text-ink-950">LUMI BOOK</div>
          )}
        </div>

        <GlassCard className="p-6">
          <div className="text-[12px] font-medium text-ink-700/70">Шаг</div>
          <div className="mt-1 text-[20px] font-semibold tracking-tightish text-ink-950">
            {step === 'service'
              ? 'Выберите услугу'
              : step === 'master'
                ? 'Выберите мастера'
                : step === 'date'
                  ? 'Выберите дату'
                  : step === 'time'
                    ? 'Выберите время'
                    : step === 'client'
                      ? 'Ваши данные'
                      : step === 'confirm'
                        ? 'Подтверждение'
                        : 'Готово'}
          </div>

          <div className="mt-4">
            <AnimatePresence mode="wait" initial={false}>
              {step === 'service' ? (
                <motion.div
                  key="service"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="space-y-2"
                >
                  {state.services.map((s) => {
                    const active = service?.id === s.id
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setService(s)
                          setStep('master')
                        }}
                        className={cn(
                          'w-full rounded-3xl border px-4 py-4 text-left shadow-soft transition',
                          active ? 'border-white/70 bg-white/75' : 'border-white/55 bg-white/55',
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[15px] font-semibold tracking-tightish text-ink-950">
                              {s.name}
                            </div>
                            <div className="mt-1 text-[12px] text-ink-700/60">{s.minutes} мин</div>
                          </div>
                          <div className="text-[13px] font-semibold text-ink-950">{s.price} ₽</div>
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              ) : null}

              {step === 'master' ? (
                <motion.div
                  key="master"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="space-y-2"
                >
                  {state.masters.map((m) => {
                    const active = master?.id === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMaster(m)
                          setStep('date')
                        }}
                        className={cn(
                          'w-full rounded-3xl border px-4 py-4 text-left shadow-soft transition',
                          active ? 'border-white/70 bg-white/75' : 'border-white/55 bg-white/55',
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-[15px] font-semibold tracking-tightish text-ink-950">
                            {m.name}
                          </div>
                          <div
                            className={cn(
                              'h-2.5 w-2.5 rounded-full',
                              m.color === 'gold' ? 'bg-gold-300/70' : 'bg-ink-400/60',
                            )}
                          />
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              ) : null}

              {step === 'date' ? (
                <motion.div
                  key="date"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {!hasAnySlotsInWindow ? (
                    <p className="text-[13px] leading-relaxed text-ink-700/65">
                      Свободных окон на ближайшие 30 дней пока нет.
                    </p>
                  ) : (
                    <BookingMonthCalendar
                      anchorTodayISO={todayISO()}
                      selectedDateISO={dateISO}
                      onSelectDate={(d) => {
                        setDateISO(d)
                        setTime(null)
                      }}
                    />
                  )}

                  <motion.button
                    type="button"
                    disabled={!hasAnySlotsInWindow || slots.length === 0}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                    onClick={() => setStep('time')}
                    className={cn(
                      'mt-4 w-full rounded-3xl px-5 py-4 text-[15px] font-medium shadow-glowGold',
                      hasAnySlotsInWindow && slots.length > 0
                        ? 'bg-ink-950 text-paper-50'
                        : 'cursor-not-allowed bg-ink-950/40 text-paper-50/80',
                    )}
                  >
                    Продолжить
                  </motion.button>
                </motion.div>
              ) : null}

              {step === 'time' ? (
                <motion.div
                  key="time"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {slots.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((t) => {
                        const active = time === t
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTime(t)}
                            className={cn(
                              'rounded-3xl border px-3 py-3 text-[13px] font-semibold shadow-soft transition',
                              active
                                ? 'border-white/70 bg-white/75 text-ink-950'
                                : 'border-white/55 bg-white/55 text-ink-950',
                            )}
                          >
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-[13px] leading-6 text-ink-700/70">
                      {!hasAnySlotsInWindow
                        ? 'Свободных окон на ближайшие 30 дней пока нет.'
                        : 'На выбранную дату свободных окон нет. Выберите другую дату.'}
                    </div>
                  )}

                  <motion.button
                    type="button"
                    disabled={!time}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                    onClick={() => setStep('client')}
                    className={cn(
                      'mt-4 w-full rounded-3xl px-5 py-4 text-[15px] font-medium shadow-glowGold',
                      time ? 'bg-ink-950 text-paper-50' : 'bg-ink-950/40 text-paper-50/80',
                    )}
                  >
                    Продолжить
                  </motion.button>
                </motion.div>
              ) : null}

              {step === 'client' ? (
                <motion.div
                  key="client"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  <LumiInput
                    label="Имя"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Например, Мария"
                  />
                  <LumiInput
                    label="Телефон"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="+7 ___ ___-__-__"
                  />

                  <LumiButton disabled={!canClient} onClick={() => setStep('confirm')}>
                    Продолжить
                  </LumiButton>
                </motion.div>
              ) : null}

              {step === 'confirm' ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  <div className="rounded-3xl border border-white/60 bg-white/55 px-4 py-4 text-[13px] leading-6 text-ink-700/70 shadow-soft">
                    <div className="font-semibold text-ink-950">{service?.name}</div>
                    <div className="mt-1">
                      {master?.name} • {dateISO} • {time}
                    </div>
                    <div className="mt-1">
                      {clientName.trim()} • {normalizePhone(phone)}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    disabled={!canConfirm}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                    onClick={() => {
                      if (!service || !master || !time) return
                      const t0 = todayISO()
                      if (!isISOInClientBookingWindow(dateISO, t0)) return
                      const now = Date.now()
                      const cleanPhone = normalizePhone(phone)
                      const name = clientName.trim()
                      const existing = state.clients.find(
                        (c) => normalizePhone(c.phone) === cleanPhone,
                      )
                      const client: Client = existing
                        ? { ...existing, name }
                        : {
                            id: uid('c'),
                            name,
                            phone: cleanPhone,
                            notes: undefined,
                            totalSpent: 0,
                            visits: 0,
                          }
                      dispatch({ type: 'upsertClient', client })
                      const bid = uid('b')
                      setBookingId(bid)
                      dispatch({
                        type: 'createBooking',
                        booking: {
                          id: bid,
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
                      setStep('success')
                    }}
                    className={cn(
                      'w-full rounded-3xl px-5 py-4 text-[15px] font-medium shadow-glowGold',
                      canConfirm ? 'bg-ink-950 text-paper-50' : 'bg-ink-950/40 text-paper-50/80',
                    )}
                  >
                    Подтвердить запись
                  </motion.button>
                </motion.div>
              ) : null}

              {step === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[12px] font-medium text-ink-700/80 shadow-soft">
                    <Check size={16} className="text-gold-400" />
                    Запись создана
                  </div>
                  <div className="text-[18px] font-semibold tracking-tightish text-ink-950">
                    Мастер получил уведомление
                  </div>
                  <div className="text-[13px] leading-6 text-ink-700/65">
                    В ближайшее время мастер подтвердит запись. Номер заявки: {bookingId ?? '—'}.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setService(null)
                      setMaster(null)
                      setTime(null)
                      setClientName('')
                      setPhone('')
                      setBookingId(null)
                      setDateISO(todayISO())
                      setStep('service')
                    }}
                    className="w-full rounded-3xl border border-white/60 bg-white/55 px-5 py-4 text-[15px] font-semibold text-ink-950 shadow-soft"
                  >
                    Записаться ещё раз
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

