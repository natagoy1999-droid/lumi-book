import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

import { glassBackdropFilter, glassFill } from '../lib/glassStyles'

export function AppBootOverlay({ active }: { active: boolean }) {
  const [logoOk, setLogoOk] = useState(true)

  const timings = useMemo(() => {
    return { fadeMs: 420 }
  }, [])

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center px-6"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: timings.fadeMs / 1000, ease: 'easeOut' }}
          style={{
            backdropFilter: glassBackdropFilter('ambient'),
            backgroundColor: `color-mix(in srgb, ${glassFill('ambient')} 88%, rgba(251,247,239,0.92))`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 44 }}
            className="flex w-full max-w-[min(88vw,280px)] flex-col items-center text-center"
          >
            {logoOk ? (
              <img
                src="/lumi-logo-transparent.png"
                alt=""
                className="h-auto max-h-[min(36vh,260px)] w-full object-contain"
                draggable={false}
                onError={() => setLogoOk(false)}
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center" aria-hidden>
                <Sparkles className="text-gold-400/75" size={64} strokeWidth={1.35} />
              </div>
            )}
            <div className="mt-6 text-[12px] font-medium tracking-tightish text-ink-700/70">
              Спокойная запись без суеты
            </div>

            <div className="mt-8 w-full max-w-[280px]">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-950/10">
                <motion.div
                  className="h-full w-[42%] rounded-full bg-gradient-to-r from-gold-200/50 via-gold-300/45 to-gold-200/35"
                  initial={{ x: '-55%' }}
                  animate={{ x: '260%' }}
                  transition={{ duration: 1.45, ease: [0.45, 0, 0.2, 1], repeat: Infinity }}
                />
              </div>
              <div className="mt-3 text-[12px] leading-[1.55] text-ink-700/58">
                Собираем ваш спокойный рабочий ритм…
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
