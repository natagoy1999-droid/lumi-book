import { motion } from 'framer-motion'
import { Plus, Sparkles, Search, Trash2, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard'
import { cn } from '../lib/cn'
import { deriveClientCardSurface } from '../lib/clientCardSoftness'
import { LumiButton } from '../components/ui/LumiButton'
import { lumiPrimaryActionSm } from '../lib/lumiActionStyles'
import { LumiEmptyState } from '../components/ui/LumiEmptyState'
import { LumiInput } from '../components/ui/LumiInput'
import { LumiModal } from '../components/ui/LumiModal'
import { LumiTextarea } from '../components/ui/LumiTextarea'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useCommunicationCalmIntel } from '../state/communicationCalmIntel'
import { useMessaging } from '../state/messaging'
import { useStore, type Client } from '../state/store'

function money(n: number | undefined) {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('ru-RU').format(v)
}

function atLocalMs(dateISO: string, time: string | undefined) {
  try {
    const [y, m, d] = (dateISO ?? '').split('-').map(Number)
    const [hh, mm] = (time ?? '0:0').split(':').map(Number)
    if (![y, m, d, hh, mm].every(Number.isFinite)) return 0
    return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
  } catch {
    return 0
  }
}

export function Clients() {
  const showInsight = useCognitiveUI((s) => s.policy.showClientAIInsight)
  const socialQuietness = useCommunicationCalmIntel((s) => s.snapshot?.socialQuietness ?? 0.35)
  const sent = useMessaging((s) => s.sent)
  const { state, dispatch } = useStore()
  const [q, setQ] = useState('')

  const [openEdit, setOpenEdit] = useState(false)
  const [draft, setDraft] = useState<Client | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const closeModal = useCallback(() => {
    setOpenEdit(false)
    setDraft(null)
    setSaveError(null)
  }, [])

  const handleAddClient = useCallback(() => {
    setSaveError(null)
    setDraft({
      id: `c_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
      name: '',
      phone: '',
      notes: '',
      totalSpent: 0,
      visits: 0,
    })
    setOpenEdit(true)
  }, [])

  const handleEditClient = useCallback((c: Client) => {
    setSaveError(null)
    setDraft({
      id: c.id,
      name: c.name ?? '',
      phone: c.phone ?? '',
      notes: c.notes ?? '',
      totalSpent: c.totalSpent ?? 0,
      visits: c.visits ?? 0,
    })
    setOpenEdit(true)
  }, [])

  const draftId = draft?.id
  const isExistingClient = useMemo(
    () => (draftId ? state.clients.some((c) => c.id === draftId) : false),
    [draftId, state.clients],
  )

  const modalOpen = openEdit && Boolean(draft)

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return state.clients
    return state.clients.filter((c) => {
      const name = (c.name ?? '').toLowerCase()
      const phone = (c.phone ?? '').toLowerCase()
      return name.includes(t) || phone.includes(t)
    })
  }, [q, state.clients])

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
          className="mb-4 space-y-1"
        >
          <div className="lumi-section-title">Клиенты</div>
          <div className="lumi-page-title">История клиентов</div>
        </motion.div>

        <GlassCard className="min-w-0 p-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/60 shadow-soft">
              <Search size={18} className="text-ink-800/75" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по имени или телефону"
              className="h-10 min-w-0 flex-1 rounded-2xl border border-white/60 bg-white/60 px-4 text-[15px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
            <button
              type="button"
              onClick={handleAddClient}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 !rounded-2xl px-4 text-[14px]',
                lumiPrimaryActionSm,
              )}
            >
              <Plus size={18} />
              Добавить
            </button>
          </div>
        </GlassCard>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 1 },
            show: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
          }}
          className="mt-3 flex min-w-0 flex-col gap-2.5"
        >
          {list.length ? (
            list.map((c) => {
              let card
              try {
                card = deriveClientCardSurface({
                  client: c,
                  bookings: state.bookings,
                  sent,
                  socialQuietness,
                })
              } catch {
                card = {
                  insightLine: '',
                  calm: 0.5,
                  preferQuietFollowUp: false,
                }
              }
              const insightText = card.insightLine.trim()
              const hideInsightBlock =
                !showInsight || (!insightText && !card.quietHint) || insightText === 'Профиль ещё формируется'
              return (
                <motion.div
                  key={c.id}
                  className="min-w-0"
                  variants={{
                    hidden: { opacity: 0, y: 4 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  <GlassCard
                    className="min-w-0 p-4"
                    style={{
                      opacity: `calc(0.94 + var(--client-card-calm, 0.48) * 0.06 * ${card.calm.toFixed(3)})`,
                    }}
                    onClick={() => handleEditClient(c)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold tracking-tightish text-ink-950">
                          {c.name?.trim() ? c.name : 'Без имени'}
                        </div>
                        <div className="mt-0.5 text-[12px] text-ink-700/65">{c.phone ?? '—'}</div>
                      </div>
                      <div className="shrink-0 rounded-xl border border-white/60 bg-white/55 px-2.5 py-1.5 text-right text-[11px] shadow-soft">
                        <div className="font-semibold text-ink-950">{money(c.totalSpent)} ₽</div>
                        <div className="text-ink-700/60">{c.visits ?? 0} визитов</div>
                      </div>
                    </div>

                    {!hideInsightBlock ? (
                      <div
                        className="lumi-card-nested mt-2.5 px-3 py-2"
                        style={{
                          opacity: `calc(0.88 + var(--relationship-softness, 0.5) * 0.12 * ${card.calm.toFixed(3)})`,
                        }}
                      >
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-700/70">
                          <Sparkles size={14} className="shrink-0 text-gold-400" strokeWidth={1.75} />
                          Заметка
                        </div>
                        {insightText ? (
                          <div className="mt-1 text-[12px] leading-snug text-ink-700/70">{card.insightLine}</div>
                        ) : null}
                        {card.quietHint ? (
                          <div className="mt-1 text-[11px] leading-snug text-ink-700/55">{card.quietHint}</div>
                        ) : null}
                      </div>
                    ) : null}

                    {c.notes ? (
                      <div
                        className={cn(
                          'lumi-card-nested mt-2.5 px-3 py-2 text-[12px] leading-snug text-ink-700/70',
                        )}
                      >
                        {c.notes}
                      </div>
                    ) : null}
                  </GlassCard>
                </motion.div>
              )
            })
          ) : (
            <LumiEmptyState
              title="Пока пусто"
              desc="Клиенты появятся автоматически после первых записей — без ручного ввода."
              icon={<Users size={18} className="text-gold-400" />}
              actionLabel="Добавить клиента"
              onAction={handleAddClient}
            />
          )}
        </motion.div>

      <LumiModal
        open={modalOpen}
        title={
          isExistingClient
            ? (draft?.name ?? '').trim()
              ? `Клиент • ${(draft?.name ?? '').trim()}`
              : 'Клиент'
            : 'Новый клиент'
        }
        onClose={closeModal}
        modalId="client"
        variant="center"
        surface="solid"
      >
        {draft ? (
          <div className="space-y-3 pb-[env(safe-area-inset-bottom)]">
            <div className="lumi-card p-4 text-[12px] leading-relaxed text-ink-700/65">
              {isExistingClient
                ? 'Измените данные или удалите карточку — записи останутся на месте.'
                : 'Добавьте клиента вручную. Телефон и заметку можно заполнить позже.'}
            </div>

            {saveError ? (
              <div className="rounded-2xl border border-gold-300/35 bg-gold-50/80 px-4 py-3 text-[13px] text-ink-800">
                {saveError}
              </div>
            ) : null}

            <LumiInput
              label="Имя"
              value={draft.name ?? ''}
              onChange={(e) => {
                setSaveError(null)
                setDraft((s) => (s ? { ...s, name: e.target.value } : s))
              }}
              placeholder="Например, Мария"
            />
            <LumiInput
              label="Телефон"
              value={draft.phone ?? ''}
              onChange={(e) => setDraft((s) => (s ? { ...s, phone: e.target.value } : s))}
              inputMode="tel"
              placeholder="+7 ___ ___-__-__"
            />
            <LumiTextarea
              label="Заметка"
              value={draft.notes ?? ''}
              onChange={(e) => setDraft((s) => (s ? { ...s, notes: e.target.value } : s))}
              rows={3}
              placeholder="Опционально"
            />

            {isExistingClient ? (
              (() => {
                const hist = state.bookings
                  .filter((b) => b.clientId === draft.id && b.status !== 'draft')
                  .slice()
                  .sort((a, b) => atLocalMs(b.dateISO, b.time) - atLocalMs(a.dateISO, a.time))
                const last = hist.find((b) => b.status !== 'cancelled') ?? hist[0]
                return (
                  <div className="lumi-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[12px] font-medium text-ink-700/70">Профиль</div>
                      <div className="text-[12px] font-medium text-ink-700/60">
                        {draft.visits ?? 0} визитов • {money(draft.totalSpent)} ₽
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="lumi-card px-4 py-3">
                        <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
                          Последний визит
                        </div>
                        <div className="mt-1 text-[13px] font-semibold text-ink-950">
                          {last ? `${last.dateISO} • ${last.time ?? '—'}` : '—'}
                        </div>
                      </div>
                      <div className="lumi-card px-4 py-3">
                        <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
                          История
                        </div>
                        <div className="mt-1 text-[13px] font-semibold text-ink-950">
                          {hist.length ? `${hist.length} записей` : '—'}
                        </div>
                      </div>
                    </div>
                    {hist.length ? (
                      <div className="mt-3 space-y-2">
                        {hist.slice(0, 5).map((b) => (
                          <div
                            key={b.id}
                            className="lumi-card px-4 py-3 text-[12px] text-ink-700/70"
                          >
                            <div className="font-semibold text-ink-950">
                              {b.dateISO} • {b.time ?? '—'}
                            </div>
                            <div className="mt-0.5">
                              {b.serviceName ?? 'Услуга'} • {money(b.price)} ₽
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })()
            ) : null}

            <LumiButton
              type="button"
              onClick={() => {
                const name = (draft.name ?? '').trim()
                if (!name) {
                  setSaveError('Введите имя клиента')
                  return
                }
                setSaveError(null)
                const phone = (draft.phone ?? '').trim()
                dispatch({
                  type: 'upsertClient',
                  client: {
                    ...draft,
                    name,
                    phone: phone || '—',
                    notes: (draft.notes ?? '').trim() || undefined,
                    totalSpent: draft.totalSpent ?? 0,
                    visits: draft.visits ?? 0,
                  },
                })
                closeModal()
              }}
            >
              Сохранить
            </LumiButton>

            <div className={cn('grid gap-2', isExistingClient ? 'grid-cols-2' : 'grid-cols-1')}>
              <LumiButton type="button" variant="secondary" size="sm" fullWidth onClick={closeModal}>
                Отмена
              </LumiButton>
              {isExistingClient ? (
                <LumiButton
                  type="button"
                  variant="destructive"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    dispatch({ type: 'deleteClient', clientId: draft.id })
                    closeModal()
                  }}
                >
                  <Trash2 size={18} />
                  Удалить
                </LumiButton>
              ) : null}
            </div>
          </div>
        ) : null}
      </LumiModal>
    </div>
  )
}

