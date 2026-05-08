import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { glassBackdropFilter, glassBorderStyle, glassFill } from '../lib/glassStyles'

export function AppBootOverlay() {
  const [visible, setVisible] = useState(true)
  const [logoOk, setLogoOk] = useState(true)

  const timings = useMemo(() => {
    // keep it short but premium; allow layout/material to settle
    return { minMs: 460, fadeMs: 320 }
  }, [])

  useEffect(() => {
    // TEMP: verify asset path in runtime
    console.log("Logo path:", "/lumi-logo-transparent.png")
    const t0 = performance.now()
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const elapsed = performance.now() - t0
        const wait = Math.max(0, timings.minMs - elapsed)
        const tm = window.setTimeout(() => setVisible(false), wait)
        return () => window.clearTimeout(tm)
      })
      return () => cancelAnimationFrame(raf2)
    })
    return () => cancelAnimationFrame(raf1)
  }, [timings.minMs])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-center px-6"
          initial={{ opacity: 1 }}
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
            className="w-full max-w-[420px] rounded-[34px] border p-6 shadow-lift ring-1 ring-black/5"
            style={{
              borderColor: glassBorderStyle('interactive'),
              backgroundColor: glassFill('interactive'),
              backdropFilter: glassBackdropFilter('interactive'),
            }}
          >
            <div className="grid place-items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="mb-4"
              >
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
                  <div className="text-[22px] font-semibold tracking-tightish text-ink-950">
                    LUMI BOOK
                  </div>
                )}
              </motion.div>
              <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">
                Calm luxury booking
              </div>
            </div>

            <div className="mt-5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-950/10">
                <motion.div
                  className="h-full w-1/2 rounded-full bg-gradient-to-r from-gold-200/60 via-gold-300/60 to-gold-200/40"
                  initial={{ x: '-40%' }}
                  animate={{ x: '160%' }}
                  transition={{ duration: 0.92, ease: 'easeInOut', repeat: Infinity }}
                />
              </div>
              <div className="mt-3 text-[12px] leading-5 text-ink-700/60">
                Мягко поднимаем данные и ритм интерфейса…
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

