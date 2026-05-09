import { Download, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { cn } from '../lib/cn'
import { useInstall } from '../state/install'

export function InstallPromptCard({ compact = false }: { compact?: boolean }) {
  const { available, installed, deferred, markInstalled, canShowPrompt, noteShown } = useInstall()
  const [busy, setBusy] = useState(false)
  const [logoOk, setLogoOk] = useState(true)

  const hidden = useMemo(
    () => installed || !available || !deferred || !canShowPrompt(),
    [available, canShowPrompt, deferred, installed],
  )
  if (hidden) return null

  useEffect(() => {
    noteShown()
  }, [noteShown])

  return (
    <div className={cn(compact ? '' : 'px-5')}>
      <div
        className={cn(
          'mx-auto max-w-[520px] rounded-[30px] border p-5 shadow-soft',
          compact && 'p-4',
        )}
        style={{ backgroundColor: '#FFFDF8', borderColor: 'rgba(20,20,20,0.08)' }}
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
              Тише. Удобнее. Как приложение.
            </div>
            <div className="mt-1 text-[12px] leading-5 text-ink-700/65">
              Добавить LUMI BOOK на экран домой?
            </div>
          </div>

          <button
            type="button"
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
          </button>
        </div>
      </div>
    </div>
  )
}

