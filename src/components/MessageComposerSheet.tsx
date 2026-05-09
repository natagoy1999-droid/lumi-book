import { AnimatePresence, motion } from 'framer-motion'
import { Copy, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '../lib/cn'
import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'
import { useMessaging, type MessageChannel } from '../state/messaging'
import { useBehavioralIntel } from '../state/behavioralIntel'
import { usePredictiveIntel } from '../state/predictiveIntel'
import { useEnergyIntel } from '../state/energyIntel'
import { useCognitiveUI } from '../state/cognitiveUI'
import { useInteractionTelemetry } from '../state/interactionTelemetry'
import { useSessionContinuity } from '../state/sessionContinuity'
import { useStore } from '../state/store'
import { useModalManager } from '../state/modalManager'
import { Sheet } from './Sheet'

const channels: Array<{ id: MessageChannel; label: string }> = [
  { id: 'sms', label: 'SMS' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'max', label: 'Max' },
]

export function MessageComposerSheet() {
  const cognitiveLoad = useCognitiveUI((s) => s.policy.load)
  const showAmbientHints = useCognitiveUI((s) => s.policy.showAmbientHints)
  const energySnap = useEnergyIntel((s) => s.snapshot)
  const predictiveAmbient = usePredictiveIntel((s) => s.composerAmbientHint)
  const { composer, closeComposer, setChannel, setText, send } = useMessaging()
  const modal = useModalManager()
  const { getClient, dispatch } = useStore()
  const [justSent, setJustSent] = useState(false)
  const lastTypingPulseRef = useRef(0)
  const tapSpring = useMemo(() => {
    const fat = energySnap?.fatigueLevel ?? 0.34
    const ie = energySnap?.interactionEnergy ?? 0.48
    const hp = energySnap?.humanePacing ?? 0.36
    return {
      type: 'spring' as const,
      stiffness: Math.round(658 - cognitiveLoad * 95 - fat * 58 + ie * 36 - hp * 44),
      damping: 42 + cognitiveLoad * 10 + fat * 12 + hp * 8,
    }
  }, [cognitiveLoad, energySnap?.fatigueLevel, energySnap?.humanePacing, energySnap?.interactionEnergy])

  const open = composer.open && 'draft' in composer && Boolean(composer.draft)
  const draft = composer.open && 'draft' in composer ? composer.draft : undefined
  const client = useMemo(() => (draft ? getClient(draft.clientId) : undefined), [draft, getClient])

  useEffect(() => {
    if (composer.open && (!('draft' in composer) || !composer.draft)) closeComposer()
  }, [closeComposer, composer])

  useEffect(() => {
    if (!open) return
    modal.open('composer')
    return () => {
      if (useModalManager.getState().active === 'composer') useModalManager.getState().close()
    }
  }, [modal, open])

  useEffect(() => {
    const a = modal.active
    if (open && a !== 'composer') closeComposer()
  }, [closeComposer, modal.active, open])

  const handleComposerClose = () => {
    const d = composer.open ? composer.draft : undefined
    if (d && d.text.trim().length >= 14) {
      useSessionContinuity.getState().recordDraftAbandoned(d)
    }
    if (open) {
      useInteractionTelemetry.getState().recordComposerClosed()
    }
    closeComposer()
  }

  useEffect(() => {
    if (open) {
      useInteractionTelemetry.getState().recordComposerOpened()
      useBehavioralIntel.getState().recordComposerOpen()
    }
  }, [open])

  useEffect(() => {
    if (!open || !draft?.text?.length) return
    const t = Date.now()
    if (t - lastTypingPulseRef.current < 340) return
    lastTypingPulseRef.current = t
    useInteractionTelemetry.getState().recordTypingPulse()
  }, [draft?.text, open, draft])

  return (
    <>
      <Sheet
        open={open}
        title={draft ? draft.title : 'Сообщение'}
        onClose={handleComposerClose}
        className="pb-6"
        modalId="composer"
      >
        {draft ? (
          <div className="flex flex-col" style={{ gap: 'var(--cognitive-inline-stack)' }}>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-medium text-ink-700/70">
                {client?.name ?? 'Клиент'}
              </div>
              <button
                type="button"
                onClick={handleComposerClose}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-soft"
              >
                <X size={14} />
                Закрыть
              </button>
            </div>

            <div
              className="flex"
              style={{
                gap: 'calc(0.5rem * var(--global-rhythm, 1) * (1 - var(--global-cognitive-load, 0) * 0.06))',
              }}
            >
              {channels.map((c) => {
                const active = draft.channel === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    className={cn(
                      'flex-1 lumi-card px-4 py-3 text-[13px] font-semibold transition',
                      active
                        ? 'bg-white/72 text-ink-950 ring-1 ring-gold-400/28'
                        : 'text-ink-800/70 hover:bg-white/62',
                    )}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>

            <div className="lumi-card rounded-[26px] p-4">
              <div className="mb-2 inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
                {showAmbientHints ? <Sparkles size={16} className="text-gold-400" /> : null}
                AI message preview
              </div>
              <textarea
                value={draft.text}
                onChange={(e) => setText(e.target.value)}
                rows={cognitiveLoad > 0.58 ? 5 : 7}
                className="w-full resize-none bg-transparent text-[14px] leading-6 text-ink-950 outline-none placeholder:text-ink-700/35"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.985 }}
                transition={tapSpring}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(draft.text)
                  } catch {
                    // ignore
                  }
                }}
                className="inline-flex items-center justify-center gap-2 lumi-card px-4 py-4 text-[13px] font-semibold text-ink-950"
              >
                <Copy size={16} />
                Скопировать
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.985 }}
                transition={tapSpring}
                onClick={() => {
                  if (draft.bookingId) {
                    // After mock-send we record "nudge" on the booking so Home logic can react.
                    dispatch({ type: 'nudgeBooking', bookingId: draft.bookingId, at: Date.now() })
                  }
                  send()
                  useSessionContinuity.getState().clearAbandonedComposer()
                  setJustSent(true)
                  setTimeout(() => setJustSent(false), 1300)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-ink-950 px-4 py-4 text-[13px] font-semibold text-paper-50 shadow-glowGold"
              >
                <Send size={16} />
                Отправить
              </motion.button>
            </div>

            {showAmbientHints ? (
              <div className="space-y-1 text-center">
                <div className="text-[12px] leading-5 text-ink-700/60">
                  1 tap: Lumi подготовила текст — вы просто отправляете.
                </div>
                {predictiveAmbient?.line ? (
                  <div
                    className="text-[11px] leading-5 text-ink-700/48"
                    style={{
                      opacity:
                        'calc((0.58 + var(--predictive-readiness, 0.5) * 0.28) * (0.84 + var(--followup-delicacy, 0.55) * 0.16) * (0.9 + var(--communication-softness, 0.52) * 0.1))',
                    }}
                  >
                    {predictiveAmbient.line}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </Sheet>

      <AnimatePresence>
        {justSent ? (
          <motion.div
            className="fixed inset-0 z-[95] grid place-items-center bg-ink-950/20 px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 12, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 520, damping: 44 }}
              className="w-full max-w-[520px] rounded-[30px] border p-6 shadow-lift ring-1 ring-black/5"
              style={{
                backdropFilter: glassBackdropFilter('interactive'),
                backgroundColor: glassFill('interactive'),
                borderColor: glassBorderStyle('interactive'),
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[12px] font-medium text-ink-700/80 shadow-soft">
                    <MessageCircle size={16} className="text-gold-400" />
                    Отправлено
                  </div>
                  <div className="mt-3 text-[18px] font-semibold tracking-tightish text-ink-950">
                    Клиенту ушло сообщение
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
                    Lumi продолжит мягкий flow, если клиент не ответит.
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/60 shadow-glowGold" />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

