import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { GlassCard } from '../components/GlassCard'
import { Sheet } from '../components/Sheet'
import { SwipeBack } from '../components/SwipeBack'
import { cn } from '../lib/cn'
import { LumiButton } from '../components/ui/LumiButton'
import { LumiInput } from '../components/ui/LumiInput'
import { LumiModal } from '../components/ui/LumiModal'
import { LumiTextarea } from '../components/ui/LumiTextarea'
import { useCognitiveUI } from '../state/cognitiveUI'
import { todayISO, useStore, type Client, type Service } from '../state/store'
import { uid as uidMsg, useMessaging } from '../state/messaging'

function addDaysISO(iso: string, delta: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function weekday(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('ru-RU', { weekday: 'long', day: '2-digit', month: 'short' })
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function NewBooking() {
  const showAmbientHints = useCognitiveUI((s) => s.policy.showAmbientHints)
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const { state, freeSlots, dispatch } = useStore()
  const openComposer = useMessaging((s) => s.openComposer)

  const master = state.masters[0]
  const qDate = sp.get('date')
  const [dateISO, setDateISO] = useState(qDate ?? todayISO())
  const [time, setTime] = useState<string | null>(null)
  const [service, setService] = useState<Service | null>(null)

  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')

  const [openTime, setOpenTime] = useState(false)
  const [openService, setOpenService] = useState(false)
  const [openClient, setOpenClient] = useState(false)
  const [openSuccess, setOpenSuccess] = useState(false)

  const days = useMemo(
    () => Array.from({ length: 8 }, (_, i) => addDaysISO(todayISO(), i)),
    [],
  )
  const slots = freeSlots(dateISO, master.id)

  useEffect(() => {
    if (qDate) setOpenTime(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canCreate = clientName.trim().length >= 2 && phone.trim().length >= 7
  const existingClient = useMemo(() => {
    const p = phone.trim()
    if (p.length < 7) return undefined
    return state.clients.find((c) => c.phone.replace(/\s+/g, '') === p.replace(/\s+/g, ''))
  }, [phone, state.clients])

  return (
    <SwipeBack className="h-[100svh]">
      <div className="px-5 pt-5 pb-28">
        <div className="mx-auto max-w-[520px]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-fog-200 px-3 py-2 text-[12px] font-medium text-ink-800/80 shadow-soft backdrop-blur-glass"
            >
              <ChevronLeft size={16} />
              Назад
            </button>

            <div className="text-right">
              <div className="text-[12px] font-medium text-ink-700/70">
                Новая запись
              </div>
              <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                {master.name}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 44 }}
            className="mt-4 flex flex-col"
            style={{ gap: 'var(--cognitive-inline-stack)' }}
          >
            {showAmbientHints ? (
              <GlassCard className="p-5">
                <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
                  <Sparkles size={16} className="text-gold-400" />
                  Логика «выбрал → дальше само»
                </div>
                <div className="mt-2 text-[14px] leading-6 text-ink-700/65">
                  Дата → время → услуга → клиент. Без кнопок «далее».
                </div>
              </GlassCard>
            ) : null}

            <GlassCard className="p-5">
              <div className="text-[12px] font-medium text-ink-700/70">Дата</div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {days.map((d) => {
                  const active = d === dateISO
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDateISO(d)
                        setOpenTime(true)
                      }}
                      className={cn(
                        'min-w-[150px] rounded-3xl border px-4 py-3 text-left shadow-soft transition',
                        active
                          ? 'border-white/60 bg-white/65'
                          : 'border-white/45 bg-fog-200 hover:bg-white/55',
                      )}
                    >
                      <div className="text-[12px] font-medium text-ink-700/70">
                        {weekday(d)}
                      </div>
                      <div className="mt-1 text-[14px] font-semibold tracking-tightish text-ink-950">
                        {active ? 'Выбрано' : 'Выбрать'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-[12px] font-medium text-ink-700/70">Сводка</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] text-ink-700/70">
                <div className="rounded-3xl border border-white/55 bg-white/55 px-4 py-3 shadow-soft">
                  <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
                    Дата
                  </div>
                  <div className="mt-1 font-semibold text-ink-950">{dateISO}</div>
                </div>
                <div className="rounded-3xl border border-white/55 bg-white/55 px-4 py-3 shadow-soft">
                  <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
                    Время
                  </div>
                  <div className="mt-1 font-semibold text-ink-950">{time ?? '—'}</div>
                </div>
                <div className="col-span-2 rounded-3xl border border-white/55 bg-white/55 px-4 py-3 shadow-soft">
                  <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
                    Услуга
                  </div>
                  <div className="mt-1 font-semibold text-ink-950">
                    {service?.name ?? '—'}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      <Sheet
        open={openTime}
        title="Выберите время — Lumi откроет услуги"
        onClose={() => setOpenTime(false)}
      >
        {slots.length ? (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTime(t)
                  setOpenTime(false)
                  setOpenService(true)
                }}
                className="rounded-3xl border border-white/60 bg-white/55 px-3 py-3 text-[13px] font-semibold text-ink-950 shadow-soft"
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-[13px] leading-6 text-ink-700/70">
            На выбранную дату свободных окон нет. Lumi может предложить перенос в один касание.
          </div>
        )}
      </Sheet>

      <Sheet
        open={openService}
        title="Выберите услугу — Lumi сразу спросит клиента"
        onClose={() => setOpenService(false)}
      >
        <div className="space-y-2">
          {state.services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setService(s)
                setOpenService(false)
                setOpenClient(true)
              }}
              className="w-full rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-left shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                  {s.name}
                </div>
                <div className="text-[12px] font-medium text-ink-700/65">
                  {s.price} ₽
                </div>
              </div>
              <div className="mt-1 text-[12px] text-ink-700/60">{s.minutes} мин</div>
            </button>
          ))}
        </div>
      </Sheet>

      <LumiModal
        open={openClient}
        title="Клиент — и готово"
        onClose={() => setOpenClient(false)}
        modalId="settings"
        variant="bottom"
        surface="glass"
      >
        <div className="space-y-3">
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
          <LumiTextarea
            label="Комментарий"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Опционально"
          />

          <LumiButton
            disabled={!canCreate || !time || !service}
            onClick={() => {
              if (!service || !time) return
              const now = Date.now()
              const bookingId = `b_${uid()}`

              const cleanPhone = phone.trim()
              const name = clientName.trim()
              const client: Client =
                existingClient ??
                ({
                  id: `c_${uid()}`,
                  name,
                  phone: cleanPhone,
                  notes: undefined,
                  totalSpent: 0,
                  visits: 0,
                } satisfies Client)

              if (!existingClient) {
                dispatch({ type: 'upsertClient', client })
              }

              dispatch({
                type: 'createBooking',
                booking: {
                  id: bookingId,
                  clientId: client.id,
                  masterId: master.id,
                  serviceId: service!.id,
                  dateISO,
                  time: time!,
                  price: service!.price,
                  status: 'pending_confirm',
                  comment: comment.trim() || undefined,
                  createdAt: now,
                },
              })

              // Mock-send: open composer with prepared text (user taps Send manually).
              openComposer({
                id: uidMsg('draft'),
                kind: 'nudge_confirm',
                clientId: client.id,
                bookingId,
                channel: 'whatsapp',
                title: `Сообщение • ${client.name}`,
                text: `Здравствуйте, ${client.name}!\nПодтвердите, пожалуйста, запись на ${dateISO} в ${time}.\n\nЕсли нужно — можем спокойно перенести время.`,
                createdAt: now,
              })
              setOpenClient(false)
              setOpenSuccess(true)
            }}
          >
            Создать — и уведомить клиента
          </LumiButton>

          <div className="text-center text-[12px] leading-5 text-ink-700/60">
            После создания Lumi автоматически отправит сообщение и будет мягко напоминать.
          </div>
        </div>
      </LumiModal>

      <AnimatePresence>
        {openSuccess ? (
          <LumiModal
            open={openSuccess}
            title={undefined}
            onClose={() => setOpenSuccess(false)}
            modalId="settings"
            variant="center"
            surface="solid"
            className="p-0"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[12px] font-medium text-ink-700/80 shadow-soft">
                    <Check size={16} className="text-gold-400" />
                    Запись создана
                  </div>
                  <div className="mt-3 text-[20px] font-semibold tracking-tightish text-ink-950">
                    Клиент уведомлён
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-ink-700/70">
                    Lumi отправила сообщение и добавила умное напоминание — можно не думать об этом.
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/60 shadow-glowGold" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <LumiButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => nav('/calendar', { replace: true })}
                >
                  В календарь
                </LumiButton>
                <LumiButton size="sm" fullWidth onClick={() => nav('/today', { replace: true })}>
                  На сегодня
                </LumiButton>
              </div>
            </div>
          </LumiModal>
        ) : null}
      </AnimatePresence>
    </SwipeBack>
  )
}

