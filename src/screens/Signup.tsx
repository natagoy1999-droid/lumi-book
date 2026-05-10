import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTE_APP_TODAY } from '../lib/appRoutes'
import { signUpWithEmail, type SignUpThrownError } from '../lib/auth'
import { hasSupabaseEnv } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'

type SignupErr = {
  message: string
  status?: number | string
  code?: string
}

export function Signup() {
  const nav = useNavigate()
  const mode = useAuthStore((s) => s.mode)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [errDetail, setErrDetail] = useState<SignupErr | null>(null)

  useEffect(() => {
    if (mode === 'auth') nav(ROUTE_APP_TODAY, { replace: true })
  }, [mode, nav])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const nameTrim = displayName.trim()
    const cleanEmail = email.trim()
    console.log('SIGNUP SUBMIT', { name: nameTrim, email: cleanEmail, passwordLength: password?.length })
    setBusy(true)
    setErrDetail(null)
    try {
      if (!hasSupabaseEnv()) {
        setErrDetail({ message: 'Supabase ENV missing' })
        return
      }
      if (!nameTrim) {
        setErrDetail({ message: 'Введите имя' })
        return
      }
      if (!cleanEmail) {
        setErrDetail({ message: 'Введите email' })
        return
      }
      if (!cleanEmail.includes('@')) {
        setErrDetail({ message: 'Введите корректный email' })
        return
      }
      if (!password) {
        setErrDetail({ message: 'Введите пароль' })
        return
      }
      if (password.length < 6) {
        setErrDetail({ message: 'Пароль должен быть не короче 6 символов' })
        return
      }

      const snap = await signUpWithEmail({
        email: cleanEmail,
        password,
        displayName: nameTrim,
      })
      if (snap.mode !== 'auth') setErrDetail({ message: 'Не удалось создать аккаунт.' })
      else nav(ROUTE_APP_TODAY, { replace: true })
    } catch (error: unknown) {
      console.error('SIGNUP ERROR', error)
      const e = error as SignUpThrownError
      const anyE = error as any
      setErrDetail({
        message: (typeof e?.message === 'string' && e.message.trim()) || 'Не удалось создать аккаунт.',
        status: anyE?.status ?? anyE?.statusCode,
        code: anyE?.code != null ? String(anyE.code) : undefined,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-5" style={{ paddingTop: 'calc(1.75rem * (0.94 + var(--global-rhythm, 1) * 0.06))' }}>
      <div className="mx-auto max-w-[520px]">
        <div className="text-[12px] font-medium tracking-tightish text-ink-700/70">Аккаунт</div>
        <div className="mt-1 text-[32px] font-semibold tracking-tightish text-ink-950">Создать аккаунт</div>
        <div className="mt-2 text-[12px] leading-5 text-ink-700/65">
          Начните спокойно — аккаунт отделяет ваши данные в облаке от учебного режима на устройстве.
        </div>

        <form className="mt-4 space-y-2" onSubmit={handleSignup}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Имя"
            autoComplete="name"
            className="w-full lumi-card bg-white/60 px-4 py-3 text-[15px] text-ink-950 outline-none placeholder:text-ink-700/35"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            placeholder="Email"
            className="w-full lumi-card bg-white/60 px-4 py-3 text-[15px] text-ink-950 outline-none placeholder:text-ink-700/35"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Пароль"
            className="w-full lumi-card bg-white/60 px-4 py-3 text-[15px] text-ink-950 outline-none placeholder:text-ink-700/35"
          />

          {!hasSupabaseEnv() ? (
            <div className="lumi-card border border-gold-400/40 bg-white/75 px-4 py-3 text-[13px] font-semibold text-ink-950 shadow-soft">
              Supabase ENV missing
            </div>
          ) : null}

          {errDetail ? (
            <div className="lumi-card space-y-1.5 px-4 py-3 text-[12px] text-ink-700/65">
              <div>{errDetail.message}</div>
              {errDetail.status != null && errDetail.status !== '' ? (
                <div className="tabular-nums text-ink-700/55">status: {String(errDetail.status)}</div>
              ) : null}
              {errDetail.code ? (
                <div className="text-ink-700/55">code: {errDetail.code}</div>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy || !hasSupabaseEnv()}
            onClick={() => console.log('SIGNUP CLICKED')}
            className="w-full rounded-3xl bg-ink-950 px-5 py-4 text-[15px] font-medium text-paper-50 shadow-glowGold disabled:opacity-70"
          >
            Создать аккаунт
          </button>

          <button
            type="button"
            onClick={() => nav('/auth')}
            className="w-full lumi-card px-4 py-3 text-[13px] font-semibold text-ink-950"
          >
            Назад
          </button>
        </form>
      </div>
    </div>
  )
}

