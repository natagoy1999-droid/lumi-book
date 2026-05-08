import { motion } from 'framer-motion'
import { Plus, Sparkles, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard'
import { Sheet } from '../components/Sheet'
import { cn } from '../lib/cn'
import { deriveClientCardSurface } from '../lib/clientCardSoftness'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useCommunicationCalmIntel } from '../state/communicationCalmIntel'
import { useMessaging } from '../state/messaging'
import { useStore, type Client } from '../state/store'

function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n)
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
      className="px-5 pb-28"
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
          <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">
            Клиенты
          </div>
          <div className="mt-1 text-[28px] font-semibold tracking-tightish text-ink-950">
            Лёгкая CRM
          </div>
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
              className="h-10 flex-1 rounded-2xl border border-white/60 bg-white/60 px-4 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
            />
            <button
              type="button"
              onClick={openNew}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-ink-950 px-4 text-[13px] font-semibold text-paper-50 shadow-glowGold"
            >
              <Plus size={18} />
              Добавить
            </button>
          </div>
        </GlassCard>

        <div className="mt-3 flex flex-col" style={{ gap: 'var(--cognitive-inline-stack)' }}>
          {list.length ? (
            list.map((c) => {
              const card = deriveClientCardSurface({
                client: c,
                bookings: state.bookings,
                sent,
                socialQuietness,
              })
              return (
                <GlassCard
                  key={c.id}
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
                        AI insight
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
              )
            })
          ) : (
            <GlassCard className="p-5">
              <div className="text-[14px] font-semibold text-ink-950">Пока пусто</div>
              <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                Клиенты появятся автоматически после первых записей — без ручного ввода.
              </div>
              <button
                type="button"
                onClick={openNew}
                className="mt-4 inline-flex items-center gap-2 rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold"
              >
                <Plus size={18} />
                Добавить клиента
              </button>
            </GlassCard>
          )}
        </div>
      </div>

      <Sheet
        open={openEdit}
        title={draft?.name?.trim() ? `Клиент • ${draft.name}` : 'Новый клиент'}
        onClose={() => setOpenEdit(false)}
      >
        {draft ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-ink-700/70">Имя</div>
              <input
                value={draft.name}
                onChange={(e) => setDraft((s) => (s ? { ...s, name: e.target.value } : s))}
                placeholder="Например, Мария"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-ink-700/70">Телефон</div>
              <input
                value={draft.phone}
                onChange={(e) => setDraft((s) => (s ? { ...s, phone: e.target.value } : s))}
                inputMode="tel"
                placeholder="+7 ___ ___-__-__"
                className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-ink-700/70">Заметки</div>
              <textarea
                value={draft.notes ?? ''}
                onChange={(e) => setDraft((s) => (s ? { ...s, notes: e.target.value } : s))}
                rows={3}
                placeholder="Опционально"
                className="w-full resize-none rounded-3xl border border-white/60 bg-white/60 px-4 py-3 text-[14px] text-ink-950 shadow-soft outline-none placeholder:text-ink-700/35"
              />
            </div>

            <button
              type="button"
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
              className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold"
            >
              Сохранить
            </button>
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}

