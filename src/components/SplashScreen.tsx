import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export function SplashScreen({ active }: { active: boolean }) {
  const [logoOk, setLogoOk] = useState(true)

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="fixed inset-0 grid place-items-center px-6"
          style={{ background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF7EF 100%)', zIndex: 9990 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.988 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.992 }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px] rounded-[34px] border p-7 shadow-lift ring-1 ring-black/5"
            style={{ backgroundColor: '#FFFDF8', borderColor: 'rgba(20,20,20,0.07)' }}
          >
            <div className="grid place-items-center text-center">
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
                <div className="text-[22px] font-semibold tracking-tightish text-ink-950">LUMI BOOK</div>
              )}
              <div className="mt-5 text-[12px] font-medium tracking-wide text-ink-900/62">
                Ещё мгновение…
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

