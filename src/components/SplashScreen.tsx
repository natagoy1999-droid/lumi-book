import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

export function SplashScreen({ active }: { active: boolean }) {
  const [logoOk, setLogoOk] = useState(true)

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="fixed inset-0 z-[9990] flex flex-col items-center justify-center px-6"
          style={{ background: 'linear-gradient(180deg, #FFFDF8 0%, #FAF7EF 100%)' }}
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
            className="flex w-full max-w-[min(88vw,280px)] flex-col items-center"
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
            <div className="mt-6 text-[12px] font-medium tracking-wide text-ink-900/62">
              Ещё мгновение…
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
