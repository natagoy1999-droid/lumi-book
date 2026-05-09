import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import { GlassCard } from './GlassCard'

export function OfflineNotice() {
  const [online, setOnline] = useState<boolean>(() => navigator.onLine)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const on = () => {
      setOnline(true)
      setDismissed(false)
    }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online || dismissed) return null

  return (
    <div className="px-5">
      <div className="mx-auto max-w-[520px]">
        <GlassCard className="p-4" tone="paper">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 shadow-soft">
                <WifiOff size={18} className="text-gold-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold tracking-tightish text-ink-950">Вы офлайн</div>
                <div className="mt-0.5 text-[12px] leading-5 text-ink-700/65">
                  Всё, что вы делаете, сохранится локально. Когда сеть вернётся — синхронизация продолжится.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-[12px] font-semibold text-ink-950 shadow-soft"
            >
              Поняла
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

