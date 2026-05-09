import { ArrowUpRight, Sparkles, Wand2 } from 'lucide-react'
import { useMemo } from 'react'

import { recoveryOpportunitySubtitle } from '../lib/humaneWording'
import { recoverySurfaceCalm } from '../lib/advisoryDelicacy'
import { cn } from '../lib/cn'
import { computeClientAIProfile } from '../lib/clientAIProfile'
import { recoveryScore } from '../lib/recoveryScoring'
import { useCommunicationCalmIntel } from '../state/communicationCalmIntel'
import { useMessaging } from '../state/messaging'
import { useRecovery } from '../state/recovery'
import { todayISO, useStore } from '../state/store'
import { GlassCard } from './GlassCard'

function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n)
}

export function RecoveryDashboard() {
  const socialQuietness = useCommunicationCalmIntel((s) => s.snapshot?.socialQuietness ?? 0.35)
  const { state } = useStore()
  const { sent } = useMessaging()
  const { chains } = useRecovery()

  const today = todayISO()

  const candidates = useMemo(() => {
    return state.clients
      .map((c) => {
        const p = computeClientAIProfile({ client: c, bookings: state.bookings, sent })
        const scenario =
          (p.daysSinceLast ?? 0) >= 42 ? 'inactive' : c.visits <= 1 ? 'first_visit' : 'inactive'
        const score = recoveryScore({ client: c, profile: p, scenario })
        return { client: c, profile: p, score }
      })
      .sort((a, b) => b.score - a.score)
  }, [sent, state.bookings, state.clients])

  const onReturn = candidates.filter((x) => (x.profile.daysSinceLast ?? 0) >= 28).length
  const potential = candidates
    .filter((x) => (x.profile.daysSinceLast ?? 0) >= 28)
    .slice(0, 6)
    .reduce((sum, x) => sum + Math.round(x.client.totalSpent / Math.max(1, x.client.visits)), 0)

  const activeChains = chains.filter((c) => c.status === 'active').length
  const opportunities = useMemo(() => {
    // A few actionable “recovery opportunities” today
    const top = candidates.slice(0, 3)
    return top.map((x) => ({
      name: x.client.name,
      bestTime: x.profile.bestMessageTime,
      label: recoveryOpportunitySubtitle({
        returnLikelihood: x.profile.returnLikelihood,
        socialQuietness,
      }),
    }))
  }, [candidates, socialQuietness])

  return (
    <GlassCard className="p-5" style={{ opacity: recoverySurfaceCalm() }}>
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
          <Sparkles size={16} className="text-gold-400" />
          Возврат
        </div>
        <div className="text-[12px] text-ink-700/55">{today}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="lumi-card px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
            На возврат
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-tightish text-ink-950">
            {onReturn}
          </div>
          <div className="mt-1 text-[12px] text-ink-700/60">клиентов</div>
        </div>
        <div className="lumi-card px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.10em] text-ink-700/55">
            Потенциал
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-tightish text-ink-950">
            {money(potential)} ₽
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-gold-400">
            <ArrowUpRight size={14} />
            спокойно
          </div>
        </div>
      </div>

      <div className="lumi-card-nested mt-3 px-4 py-3">
        <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
          <Wand2 size={16} className="text-gold-400" />
          Активные chains
        </div>
        <div className="mt-1 text-[14px] font-semibold tracking-tightish text-ink-950">
          {activeChains ? `${activeChains} активных сценария` : 'Сценарии не активны'}
        </div>
        <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
          Lumi включает цепочки только когда это уместно — без шума и CRM‑ощущения.
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {opportunities.map((o) => (
          <div
            key={o.name}
            className={cn(
              'lumi-card px-4 py-3',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                  {o.name}
                </div>
                <div className="mt-0.5 text-[12px] text-ink-700/65">{o.label}</div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-soft">
                лучше в {o.bestTime}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

