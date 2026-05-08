import { motion } from 'framer-motion'
import { Download, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '../lib/cn'
import { useInstall } from '../state/install'

export function InstallPromptCard({ compact = false }: { compact?: boolean }) {
  const { available, installed, deferred, markInstalled } = useInstall()
  const [busy, setBusy] = useState(false)
  const [logoOk, setLogoOk] = useState(true)

  const hidden = useMemo(() => installed || !available || !deferred, [available, deferred, installed])
  if (hidden) return null

  return (
    <div className={cn(compact ? '' : 'px-5')}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 44 }}
        className={cn(
          'mx-auto max-w-[520px] rounded-[30px] border border-white/55 bg-white/55 p-5 shadow-soft backdrop-blur-glass',
          compact && 'p-4',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2">
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
                <div className="text-[12px] font-semibold tracking-tightish text-ink-950">
                  LUMI BOOK
                </div>
              )}
            </div>
            <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-700/70">
              <Sparkles size={16} className="text-gold-400" />
              Установить как приложение
            </div>
            <div className="mt-1 text-[14px] font-semibold tracking-tightish text-ink-950">
              Быстрее. Тише. Как native.
            </div>
            <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
              Добавьте LUMI BOOK на экран — будет открываться в standalone режиме.
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 600, damping: 40 }}
            disabled={busy}
            onClick={async () => {
              if (!deferred) return
              setBusy(true)
              try {
                await deferred.prompt()
                const res = await deferred.userChoice
                if (res.outcome === 'accepted') markInstalled()
              } finally {
                setBusy(false)
              }
            }}
            className={cn(
              'inline-flex items-center gap-2 rounded-3xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-paper-50 shadow-glowGold',
              busy && 'opacity-80',
            )}
          >
            <Download size={18} />
            Установить
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

