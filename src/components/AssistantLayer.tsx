import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { buildBehavioralWhisperCard } from '../lib/anticipatoryUI'
import { buildFlowContinuityCard } from '../lib/flowContinuityHints'
import { buildCalmReassuranceCard } from '../lib/calmReassurance'
import { buildIntentGuidanceCard } from '../lib/intentAwareness'
import { buildGentleResumptionCard } from '../lib/gentleResumption'
import { buildAssistantCards } from '../lib/assistantRecommendations'
import { advisoryShellOpacity, withSocialQuietMul } from '../lib/advisoryDelicacy'
import { cn } from '../lib/cn'
import { useBehavioralIntel } from '../state/behavioralIntel'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useEmotionalSafetyIntel } from '../state/emotionalSafetyIntel'
import { useFlowIntel } from '../state/flowIntel'
import { useTrustIntel } from '../state/trustIntel'
import { useContextIntel } from '../state/contextIntel'
import { useTemporalIntel } from '../state/temporalIntel'
import { useIntentIntel } from '../state/intentIntel'
import { useSessionContinuity } from '../state/sessionContinuity'
import { useMessaging } from '../state/messaging'
import { useAssistantUI } from '../state/assistant'
import { todayISO, useStore } from '../state/store'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import { GlassCard } from './GlassCard'

function breathing() {
  return {
    y: [0, -2, 0],
    transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const },
  }
}

function glowPulse() {
  return {
    opacity: [0.35, 0.55, 0.35],
    transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
  }
}

export function AssistantLayer({ compact = false }: { compact?: boolean }) {
  const loc = useLocation()
  const behavioralSnap = useBehavioralIntel((s) => s.lastSnapshot)
  const { state } = useStore()
  const sent = useMessaging((s) => s.sent)
  const master = state.masters[0]
  const cognitiveLoad = useCognitiveUI((s) => s.policy.load)
  const assistantCap = useCognitiveUI((s) => s.policy.assistantCap)
  const layoutBalance = useCognitiveUI((s) => s.policy.layoutBalance)
  const aiConfidence = useTrustIntel((s) => s.lastAIConfidence)
  const anticipationQ = useTrustIntel((s) => s.lastAnticipationQuietness)
  const whisperDismissLen = useTrustIntel((s) => s.whisperDismissTs.length)
  const emotionalBundle = useEmotionalSafetyIntel((s) => s.bundle)
  const flowBundle = useFlowIntel((s) => s.bundle)
  const dayISO = todayISO()
  const bookingsTodayN = useMemo(
    () => state.bookings.filter((b) => b.dateISO === dayISO && b.status !== 'cancelled').length,
    [dayISO, state.bookings],
  )
  const pendingN = useMemo(
    () =>
      state.bookings.filter((b) => b.status === 'pending_confirm' && b.dateISO === dayISO).length,
    [dayISO, state.bookings],
  )
  const rescheduleN = useMemo(
    () => state.bookings.filter((b) => b.status === 'reschedule_pending').length,
    [state.bookings],
  )

  const ctxDerived = useContextIntel((s) => s.derived)
  const lastPrimaryPath = useSessionContinuity((s) => s.lastPrimaryPath)
  const justResumedFromBackground = useSessionContinuity((s) => s.justResumedFromBackground)
  const abandonedComposerAt = useSessionContinuity((s) => s.abandonedComposerAt)
  const intentModel = useIntentIntel((s) => s.model)
  const temporalSnap = useTemporalIntel((s) => s.snapshot)
  const composerOpen = useMessaging((s) => s.composer.open)

  const [tick, setTick] = useState(0)
  const { dismissed, dismiss, clearAllExpired } = useAssistantUI()

  useEffect(() => {
    const iv = setInterval(() => setTick((x) => x + 1), 60_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    clearAllExpired(Date.now())
  }, [tick, clearAllExpired])

  const trustSuppressionScore = useMemo(
    () => useTrustIntel.getState().trustSuppression(),
    [whisperDismissLen, tick],
  )

  const cardsRaw = useMemo(() => {
    const base = buildAssistantCards({
      clients: state.clients,
      bookings: state.bookings,
      events: state.events,
      sent,
      dismissed,
      now: Date.now(),
      masterId: master.id,
    })
    const whisper = buildBehavioralWhisperCard({
      pathname: loc.pathname,
      behavioral: behavioralSnap,
      cognitiveLoad,
      aiConfidence,
      trustSuppression: trustSuppressionScore,
      dismissed,
      now: Date.now(),
    })
    const reassurance = buildCalmReassuranceCard({
      pathname: loc.pathname,
      stressPressure: emotionalBundle?.stressPressure ?? 0,
      reassuranceLevel: emotionalBundle?.reassuranceLevel ?? 0,
      calmAssistance: emotionalBundle?.calmAssistance ?? 0,
      cognitiveLoad,
      pendingCount: pendingN,
      bookingsTodayActive: bookingsTodayN,
      dismissed,
      now: Date.now(),
    })
    const flowHint = buildFlowContinuityCard({
      pathname: loc.pathname,
      flowMomentum: flowBundle?.flowMomentum ?? 0,
      workflowCalm: flowBundle?.workflowCalm ?? 0,
      cognitiveLoad,
      reschedulePending: rescheduleN,
      pendingConfirm: pendingN,
      dismissed,
      now: Date.now(),
    })
    const gentle = buildGentleResumptionCard({
      pathname: loc.pathname,
      cognitiveLoad,
      aiConfidence,
      unfinishedPressure: ctxDerived?.unfinishedPressure ?? 0,
      contextMemoryScore: ctxDerived?.contextMemoryScore ?? 0,
      reschedulePending: rescheduleN,
      pendingConfirm: pendingN,
      lastPrimaryPath,
      justResumedFromBackground,
      abandonedComposerAt,
      dismissed,
      now: Date.now(),
      assistanceWindow: temporalSnap?.assistanceWindow,
      proactiveSuppression: temporalSnap?.proactiveSuppression,
    })
    const intentHint = buildIntentGuidanceCard({
      pathname: loc.pathname,
      cognitiveLoad,
      aiConfidence,
      intent: intentModel,
      reschedulePending: rescheduleN,
      pendingConfirm: pendingN,
      composerOpen,
      dismissed,
      now: Date.now(),
    })
    const merged = [...base, whisper, reassurance, flowHint, gentle, intentHint].filter(
      Boolean,
    ) as typeof base
    merged.sort((a, b) => a.priority - b.priority)

    let list = merged
    if (temporalSnap && temporalSnap.proactiveSuppression > 0.52) {
      list = merged.filter((c) => {
        if (c.kind === 'behavioral_whisper' || c.kind === 'intent_whisper') return false
        if (temporalSnap.proactiveSuppression > 0.62 && c.kind === 'flow_continuity') return false
        if (temporalSnap.proactiveSuppression > 0.58 && c.kind === 'continuity_whisper') return false
        return true
      })
    }

    const effCap = temporalSnap
      ? Math.max(1, Math.round(assistantCap * (0.44 + temporalSnap.assistanceWindow * 0.56)))
      : assistantCap

    return list.slice(0, Math.min(6, effCap))
  }, [
    aiConfidence,
    assistantCap,
    behavioralSnap,
    abandonedComposerAt,
    bookingsTodayN,
    composerOpen,
    cognitiveLoad,
    ctxDerived?.contextMemoryScore,
    ctxDerived?.unfinishedPressure,
    dismissed,
    emotionalBundle,
    flowBundle,
    intentModel,
    justResumedFromBackground,
    lastPrimaryPath,
    loc.pathname,
    master.id,
    pendingN,
    rescheduleN,
    sent,
    state.bookings,
    state.clients,
    state.events,
    temporalSnap,
    tick,
    trustSuppressionScore,
  ])

  const cards = cardsRaw

  const calmGlow = cognitiveLoad > 0.54

  if (!cards.length) return null

  return (
    <GlassCard
      materialTier="focus"
      className={cn('p-5', compact && 'p-4')}
      style={{
        opacity: advisoryShellOpacity(),
      }}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/45 px-3 py-1 text-[12px] font-semibold text-ink-800/70 shadow-soft">
          <Sparkles size={16} className="text-gold-400" />
          Lumi Assistant
        </div>
        <div className="text-[12px] text-ink-700/55">тихо и по делу</div>
      </div>

      <motion.div
        layout
        className={cn('mt-4 flex flex-col', compact && 'mt-3')}
        style={{
          gap: compact
            ? 'calc(var(--cognitive-inline-stack) * 0.92 + (1 - var(--layout-balance, 0.26)) * 4px)'
            : 'calc(var(--cognitive-inline-stack) * 1.05 + (1 - var(--layout-balance, 0.26)) * 5px)',
        }}
      >
        <AnimatePresence initial={false}>
          {cards.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{
                type: 'spring',
                stiffness: Math.max(
                  320,
                  548 - layoutBalance * 92 - anticipationQ * 72,
                ),
                damping: 44 + anticipationQ * 12,
                mass: 0.82 + layoutBalance * 0.06 + anticipationQ * 0.05,
              }}
              className={cn(
                'relative overflow-hidden rounded-3xl border px-4 py-3 shadow-soft',
                compact && 'px-3 py-2',
              )}
              style={{
                backdropFilter: glassBackdropFilter('interactive'),
                backgroundColor: glassFill('interactive'),
                borderColor: glassBorderStyle('interactive'),
                ...(c.kind === 'behavioral_whisper'
                  ? { opacity: withSocialQuietMul('var(--predictive-opacity, 0.82)') }
                  : c.kind === 'calm_reassurance'
                    ? {
                        opacity: withSocialQuietMul(
                          '0.72 + var(--reassurance-level, 0) * 0.16 + var(--calm-assistance, 0) * 0.08',
                        ),
                      }
                    : c.kind === 'flow_continuity'
                      ? {
                          opacity: withSocialQuietMul(
                            '0.68 + var(--workflow-calm, 0) * 0.14 + var(--focus-continuity, 0) * 0.12',
                          ),
                        }
                      : c.kind === 'continuity_whisper'
                        ? {
                            opacity: withSocialQuietMul(
                              '0.62 + var(--session-calm, 0.72) * 0.22 + var(--resumption-softness, 0.55) * 0.12',
                            ),
                          }
                        : c.kind === 'intent_whisper'
                          ? {
                              opacity: withSocialQuietMul(
                                '0.58 + var(--intent-confidence, 0.5) * 0.2 + var(--workflow-intent, 0) * 0.12 + var(--intent-focus, 0.5) * 0.1',
                              ),
                            }
                          : {}),
              }}
            >
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(420px 180px at 12% 0%, rgba(214,178,90,0.22), transparent 55%)',
                }}
                animate={calmGlow ? { opacity: 0.4 } : glowPulse()}
              />

              <button
                type="button"
                aria-label="Hide"
                onClick={() => {
                  if (c.kind === 'behavioral_whisper') {
                    useTrustIntel.getState().recordPredictionDismiss()
                  }
                  dismiss(c.id, { ttlMs: 6 * 60 * 60 * 1000 })
                }}
                className="absolute right-2 top-2 rounded-2xl border border-white/60 bg-white/55 p-2 text-ink-800/60 shadow-soft"
              >
                <X size={14} />
              </button>

              <motion.div
                animate={!calmGlow && c.tone === 'gold' ? breathing() : undefined}
                className={cn('pr-10', compact && 'pr-8')}
              >
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">
                  {c.title}
                </div>
                {c.subtitle ? (
                  <div
                    className={cn(
                      'mt-0.5 text-[12px] leading-5 text-ink-700/65',
                      compact && 'line-clamp-1',
                    )}
                  >
                    {c.subtitle}
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </GlassCard>
  )
}

