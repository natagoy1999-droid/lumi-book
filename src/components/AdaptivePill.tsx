import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { cn } from '../lib/cn'
import { breatheAnim, motionFor } from '../lib/priorityMotion'
import { weightFromScore } from '../lib/visualWeight'
import { getVarNumber } from '../lib/breathingFreeze'
import { glassBackdropFilter } from '../lib/glassStyles'
import { buildSecondaryMatteMask } from '../lib/matteMask'

export function AdaptivePill({
  label,
  onClick,
  score,
  role,
  compactness,
}: {
  label: string
  onClick: () => void
  score: number
  role: 'dominant' | 'secondary'
  compactness: 'normal' | 'ultra'
}) {
  const w = weightFromScore({ score, role, compactness })
  const m = motionFor({ role, compactness })

  const isDominant = role === 'dominant'
  const quiet = 1 - getVarNumber('--motion-quietness', 0) * 0.85
  const freeze = 1 - getVarNumber('--motion-freeze', 0) * 0.92
  const focusContrast = getVarNumber('--focus-contrast', 0)
  const dist = getVarNumber('--glass-distance', 0)
  const frost = getVarNumber('--frost-opacity', 0.03)
  const noise = getVarNumber('--surface-noise', 0.06)
  const frostMul = getVarNumber('--frost-mul', 1) * getVarNumber('--frost-ambient-mul', 1)
  const noiseMul = getVarNumber('--noise-mul', 1)
  const edgeSharp = getVarNumber('--edge-sharpness', 0.45)
  const breathing = getVarNumber('--glass-breathing', 1)
  const decisionClarity = getVarNumber('--decision-clarity', 0.62)
  const actionFocus = getVarNumber('--action-focus', 0.55)
  const secondaryQuietness = getVarNumber('--secondary-quietness', 0.28)
  const safeFocus = getVarNumber('--safe-focus', 0.45)
  const matteDepth = getVarNumber('--matte-depth', 0)
  const materialFalloff = getVarNumber('--material-falloff', 0)
  const depthDiffusion = getVarNumber('--depth-diffusion', 0)
  const focusDistance = getVarNumber('--focus-distance', 0)
  const focusEdgeDensity = getVarNumber('--focus-edge-density', 1)
  const edgeInset = getVarNumber('--edge-inset', 10)
  const edgeInsetExtra = getVarNumber('--edge-inset-extra', 0)
  const edgeShortening = getVarNumber('--edge-shortening', 0)
  const depthShiftPx = getVarNumber('--depth-shift', 0)
  const breath =
    getVarNumber('--breathing-intensity', 1) *
    getVarNumber('--motion-decay', 1) *
    quiet *
    freeze
  const amp =
    isDominant
      ? (compactness === 'ultra' ? 0.8 : 1.4) * w.glow * breath * (1 - safeFocus * 0.18)
      : 0

  const matteMask = buildSecondaryMatteMask({
    matteDepth,
    materialFalloff,
    depthDiffusion,
  })
  const secondaryBlurMul = 1 + materialFalloff * 0.072 + depthDiffusion * 0.04

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: m.stiffness, damping: m.damping, mass: m.mass }}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full border font-semibold shadow-soft',
        isDominant
          ? 'bg-ink-950 text-paper-50 border-gold-200/60'
          : 'bg-white/55 text-ink-950 border-white/60',
      )}
      style={{
        backdropFilter: isDominant
          ? glassBackdropFilter('focus')
          : `blur(calc(var(--glass-blur, 18px) * var(--glass-diffuse, 1) * ${secondaryBlurMul.toFixed(4)}))`,
        transform: `translateY(${
          isDominant
            ? `${(-depthShiftPx * (1 + focusDistance * 0.26)).toFixed(3)}px`
            : `${(depthShiftPx * (0.54 - focusDistance * 0.14)).toFixed(3)}px`
        }) scale(${w.scale.toFixed(3)})`,
        opacity:
          w.opacity *
          (isDominant ? 0.985 + decisionClarity * 0.015 + actionFocus * 0.02 : 1) *
          (isDominant ? 1 : 1 - getVarNumber('--secondary-fade', 0) * 0.22) *
          (isDominant ? 1 : 1 - safeFocus * 0.26) *
          (isDominant ? 1 : 1 - secondaryQuietness * 0.26),
        fontSize: 'var(--pill-font, 12px)',
        paddingLeft: `calc(var(--pill-pad-x, 14px) + ${
          isDominant ? 'var(--dominant-extra-pad-x, 4px)' : '0px'
        })`,
        paddingRight: `calc(var(--pill-pad-x, 14px) + ${
          isDominant ? 'var(--dominant-extra-pad-x, 4px)' : '0px'
        })`,
        paddingTop: `calc(var(--pill-pad-y, 10px) + ${
          isDominant ? 'var(--dominant-extra-pad-y, 2px)' : '0px'
        })`,
        paddingBottom: `calc(var(--pill-pad-y, 10px) + ${
          isDominant ? 'var(--dominant-extra-pad-y, 2px)' : '0px'
        })`,
        borderColor: isDominant
          ? `rgba(14,16,22,var(--ink-border, 0.22))`
          : `rgba(255,255,255,${(0.40 - dist * 0.18 - materialFalloff * 0.07).toFixed(3)})`,
        backgroundColor: !isDominant
          ? `rgba(${dist > 0.35 ? '236,242,255' : '255,255,255'},${(
              0.52 -
              dist * 0.14 -
              materialFalloff * 0.055 -
              depthDiffusion * 0.03
            ).toFixed(3)})`
          : undefined,
        boxShadow: isDominant
          ? `0 0 0 1px rgba(var(--glow-temperature),${(
              (0.18 + 0.18 * focusContrast) *
              w.glow
            ).toFixed(3)}), 0 12px 32px rgba(var(--glow-temperature),${(
              (0.16 + 0.12 * (1 - getVarNumber('--urgency-stillness', 0))) *
              w.glow
            ).toFixed(3)})`
          : undefined,
      }}
      animate={breatheAnim(m.breathe ? amp : 0)}
    >
      {/* ultra-subtle frost noise (secondary only) */}
      {!isDominant ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: frost * frostMul * breathing,
            mixBlendMode: 'soft-light',
            backgroundImage: [
              // micro “frost” without visible grain: layered soft radials
              'radial-gradient(16px 12px at 14% 22%, rgba(255,255,255,0.55), transparent 60%)',
              'radial-gradient(18px 14px at 62% 34%, rgba(255,255,255,0.45), transparent 62%)',
              'radial-gradient(14px 10px at 78% 72%, rgba(255,255,255,0.50), transparent 60%)',
              'radial-gradient(22px 18px at 34% 78%, rgba(255,255,255,0.38), transparent 64%)',
              // very subtle directional haze
              'linear-gradient(135deg, rgba(255,255,255,0.10), transparent 55%, rgba(255,255,255,0.08))',
            ].join(','),
            filter: `blur(${(0.6 + noise * noiseMul * 0.6 * (1 + depthDiffusion * 0.35)).toFixed(2)}px)`,
            WebkitMaskImage: matteMask,
            maskImage: matteMask,
          }}
        />
      ) : null}

      {isDominant ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[6px] h-px"
          style={{
            left: `${edgeInset + edgeInsetExtra + edgeShortening * 20}px`,
            right: `${edgeInset + edgeInsetExtra + edgeShortening * 20}px`,
            background:
              `linear-gradient(90deg, transparent, rgba(var(--edge-highlight, 255 255 255), calc(var(--focus-edge-opacity, 0.06) * ${
                (0.75 + edgeSharp * 0.45) * focusEdgeDensity
              })), transparent)`,
          }}
        />
      ) : null}
      <Sparkles
        size={14}
        className={cn(
          'transition',
          isDominant ? 'text-gold-400' : 'text-ink-800/60',
        )}
        style={{ opacity: isDominant ? 1 : 0.65 }}
      />
      <span
        className="leading-none"
        style={{ letterSpacing: '-0.01em', opacity: 0.86 + w.contrast * 0.14 }}
      >
        {label}
      </span>
    </motion.button>
  )
}

