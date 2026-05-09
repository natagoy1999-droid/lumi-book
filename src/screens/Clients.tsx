import { motion } from 'framer-motion'
import { Plus, Sparkles, Search, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard'
import { cn } from '../lib/cn'
import { deriveClientCardSurface } from '../lib/clientCardSoftness'
import { LumiButton } from '../components/ui/LumiButton'
import { LumiEmptyState } from '../components/ui/LumiEmptyState'
import { LumiInput } from '../components/ui/LumiInput'
import { LumiModal } from '../components/ui/LumiModal'
import { LumiTextarea } from '../components/ui/LumiTextarea'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useCommunicationCalmIntel } from '../state/communicationCalmIntel'
import { useMessaging } from '../state/messaging'
import { useStore, type Client } from '../state/store'

function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n)
}

function atLocalMs(dateISO: string, time: string) {
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

export function Clients() {
  const showInsight = useCognitiveUI((s) => s.policy.showClientAIInsight)
  const socialQuietness = useCommunicationCalmIntel((s) => s.snapshot?.socialQuietness ?? 0.35)
  const sent = useMessaging((s) => s.sent)
  const { state, dispatch } = useStore()
  const [q, setQ] = useState('')

  const [openEdit, setOpenEdit] = useState(false)
  const [draft, setDraft] = useState<Client | null>(null)

  const openNew = () => {
    setDraft({
      id: `c_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`,
      name: '',
      phone: '',
      notes: '',
      totalSpent: 0,
      visits: 0,
    })
    setOpenEdit(true)
  }

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return state.clients
    return state.clients.filter(
      (c) => c.name.toLowerCase().includes(t) || c.phone.toLowerCase().includes(t),
    )
  }, [q, state.clients])

  return (
    <div
      className="lumi-page"
      style={{
        paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))',
      }}
    >
      <div className="mx-auto max-w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 44 }}
          className="mb-4"
        >
          <div className="lumi-section-title">Клиенты</div>
          <div className="mt-1 lumi-title">Лёгкая CRM</div>
        </motion.div>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 shadow-soft">
              <Search size={18} className="text-ink-800/75" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по имени или телефону"
              className="h-10 flex-1 rounded-2xl border border-white/60 bg-white/60 px-4 text-[15px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
            <button
              type="button"
              onClick={openNew}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-ink-950 px-4 text-[14px] font-semibold text-paper-50 shadow-glowGold"
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
          className="mt-3 flex flex-col"
          style={{ gap: 'var(--cognitive-inline-stack)' }}
        >
          {list.length ? (
            list.map((c) => {
              const card = deriveClientCardSurface({
                client: c,
                bookings: state.bookings,
                sent,
                socialQuietness,
              })
              return (
                <motion.div
                  key={c.id}
                  variants={{
                    hidden: { opacity: 0, y: 4 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  <GlassCard
                    className="p-5"
                    style={{
                      opacity: `calc(0.94 + var(--client-card-calm, 0.48) * 0.06 * ${card.calm.toFixed(3)})`,
                    }}
                    onClick={() => {
                      setDraft({ ...c })
                      setOpenEdit(true)
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[16px] font-semibold tracking-tightish text-ink-950">
                          {c.name}
                        </div>
                        <div className="mt-1 text-[12px] text-ink-700/65">{c.phone}</div>
                      </div>
                      <div className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-right text-[12px] shadow-soft">
                        <div className="font-semibold text-ink-950">{money(c.totalSpent)} ₽</div>
                        <div className="text-ink-700/60">{c.visits} визитов</div>
                      </div>
                    </div>

                    {showInsight ? (
                      <div
                        className="mt-4 rounded-3xl border border-white/60 bg-white/50 px-4 py-3 shadow-soft"
                        style={{
                          opacity: `calc(0.88 + var(--relationship-softness, 0.5) * 0.12 * ${card.calm.toFixed(3)})`,
                        }}
                      >
                        <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
                          <Sparkles size={16} className="text-gold-400" />
                          Спокойная заметка
                        </div>
                        <div className="mt-1 text-[12px] leading-5 text-ink-700/70">
                          {card.insightLine}
                        </div>
                        {card.quietHint ? (
                          <div className="mt-2 text-[11px] leading-5 text-ink-700/55">{card.quietHint}</div>
                        ) : null}
                      </div>
                    ) : null}

                    {c.notes ? (
                      <div
                        className={cn(
                          'mt-4 rounded-3xl border border-white/60 bg-white/50 px-4 py-3',
                          'text-[12px] leading-5 text-ink-700/70 shadow-soft',
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
              onAction={openNew}
            />
          )}
        </motion.div>
      </div>

      <LumiModal
        open={openEdit}
        title={draft?.name?.trim() ? `Клиент • ${draft.name}` : 'Новый клиент'}
        onClose={() => setOpenEdit(false)}
        modalId="settings"
        variant="center"
        surface="solid"
      >
        {draft ? (
          <div className="space-y-3">
            <div className="rounded-3xl border border-white/60 bg-white/55 p-4 text-[12px] text-ink-700/65 shadow-soft">
              Нажмите на карточку клиента, чтобы изменить данные. Удаление безопасно — записи не сломаются.
            </div>

            <LumiInput
              label="Имя"
              value={draft.name}
              onChange={(e) => setDraft((s) => (s ? { ...s, name: e.target.value } : s))}
              placeholder="Например, Мария"
            />
            <LumiInput
              label="Телефон"
              value={draft.phone}
              onChange={(e) => setDraft((s) => (s ? { ...s, phone: e.target.value } : s))}
              inputMode="tel"
              placeholder="+7 ___ ___-__-__"
            />
            <LumiTextarea
              label="Заметки"
              value={draft.notes ?? ''}
              onChange={(e) => setDraft((s) => (s ? { ...s, notes: e.target.value } : s))}
              rows={3}
              placeholder="Опционально"
            />

            {(() => {
              const hist = state.bookings
                .filter((b) => b.clientId === draft.id && b.status !== 'draft')
                .slice()
                .sort((a, b) => atLocalMs(b.dateISO, b.time) - atLocalMs(a.dateISO, a.time))
              const last = hist.find((b) => b.status !== 'cancelled') ?? hist[0]
              return (
                <div className="rounded-3xl border border-white/60 bg-white/55 p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[12px] font-medium text-ink-700/70">Профиль</div>
                    <div className="text-[12px] font-medium text-ink-700/60">
                      {draft.visits} визитов • {money(draft.totalSpent)} ₽
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft">
                      <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
                        Последний визит
                      </div>
                      <div className="mt-1 text-[13px] font-semibold text-ink-950">
                        {last ? `${last.dateISO} • ${last.time}` : '—'}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 shadow-soft">
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
                          className="rounded-3xl border border-white/60 bg-white/55 px-4 py-3 text-[12px] text-ink-700/70 shadow-soft"
                        >
                          <div className="font-semibold text-ink-950">{b.dateISO} • {b.time}</div>
                          <div className="mt-0.5">
                            {b.serviceName ?? 'Услуга'} • {money(b.price)} ₽
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })()}

            <LumiButton
              onClick={() => {
                const name = draft.name.trim()
                const phone = draft.phone.trim()
                if (name.length < 2 || phone.length < 7) return
                dispatch({
                  type: 'upsertClient',
                  client: {
                    ...draft,
                    name,
                    phone,
                    notes: draft.notes?.trim() || undefined,
                    totalSpent: draft.totalSpent ?? 0,
                    visits: draft.visits ?? 0,
                  },
                })
                setOpenEdit(false)
              }}
            >
              Сохранить
            </LumiButton>

            <div className="grid grid-cols-2 gap-2">
              <LumiButton variant="secondary" size="sm" fullWidth onClick={() => setOpenEdit(false)}>
                Отмена
              </LumiButton>
              <LumiButton
                variant="destructive"
                size="sm"
                fullWidth
                onClick={() => {
                  dispatch({ type: 'deleteClient', clientId: draft.id })
                  setOpenEdit(false)
                }}
              >
                <Trash2 size={18} />
                Удалить
              </LumiButton>
            </div>
          </div>
        ) : null}
      </LumiModal>
    </div>
  )
}

