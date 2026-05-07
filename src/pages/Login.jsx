import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Scale, ShieldCheck, BadgeCheck, AlertTriangle, KeyRound } from 'lucide-react'
import { useAuth, DEMO_CREDENTIALS } from '../lib/auth'

export default function Login() {
  const { login, loginDemo, isSupabaseConfigured } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const next = loc.state?.next || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      // If the user typed the demo credentials, use the demo path so it
      // doesn't fail against Supabase auth.
      const lower = email.toLowerCase().trim()
      if (lower === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        await loginDemo(DEMO_CREDENTIALS.email)
      } else {
        await login(email, password)
      }
      nav(next, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  // Auto-fill the form with the demo credentials and sign in immediately.
  const useDemo = async () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setError(null)
    setBusy(true)
    try {
      await loginDemo(DEMO_CREDENTIALS.email)
      nav(next, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr,1fr]">
      {/* Left brand panel */}
      <aside className="hidden flex-col justify-between bg-sidebar p-12 text-white/85 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gold/15 text-gold ring-1 ring-gold/40">
              <Scale className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <div className="font-serif text-xl font-semibold text-white">CCMS</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                Court Case Monitoring System
              </div>
            </div>
          </div>

          <h1 className="mt-16 max-w-md font-serif text-4xl font-semibold leading-tight text-white">
            From court judgments
            <br /> to verified action plans.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
            An AI system that reads disposal judgments, drafts compliance and appeal recommendations,
            and surfaces only the records a competent authority has signed off on.
          </p>

          <div className="mt-10 space-y-3 text-sm">
            <Bullet icon={ShieldCheck} text="Mandatory human-in-the-loop verification" />
            <Bullet icon={BadgeCheck} text="Decision support — never automation" />
          </div>
        </div>

        <p className="text-[11px] text-white/40">
          Centre for e-Governance · Government of Telangana
        </p>
      </aside>

      {/* Right form panel */}
      <main className="relative flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar text-gold">
              <Scale className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="font-serif text-xl font-semibold text-ink">CCMS</span>
          </div>

          <h2 className="font-serif text-2xl font-semibold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-muted">
            {isSupabaseConfigured
              ? 'Use your government-issued credentials.'
              : 'Demo mode — any email & password works.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@telangana.gov.in"
                className="mt-1 w-full rounded-md bg-surface px-3 py-2.5 text-sm text-ink ring-1 ring-line focus:outline-none focus:ring-gold/60"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-md bg-surface px-3 py-2.5 text-sm text-ink ring-1 ring-line focus:outline-none focus:ring-gold/60"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" strokeWidth={2.2} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-ink py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-sidebar disabled:opacity-50"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo credentials card — bottom-right */}
        <div className="absolute bottom-6 right-6 hidden w-[260px] rounded-xl bg-surface p-3.5 shadow-card ring-1 ring-line md:block">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/10 text-gold ring-1 ring-gold/30">
              <KeyRound className="h-3 w-3" strokeWidth={2.4} />
            </span>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Demo credentials
            </div>
          </div>

          <dl className="mt-2.5 space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">user</dt>
              <dd className="font-semibold text-ink">{DEMO_CREDENTIALS.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">pass</dt>
              <dd className="font-semibold text-ink">{DEMO_CREDENTIALS.password}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={useDemo}
            disabled={busy}
            className="mt-3 w-full rounded-md bg-ink py-1.5 text-[11px] font-semibold text-white transition hover:bg-sidebar disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Use these'}
          </button>
        </div>
      </main>
    </div>
  )
}

function Bullet({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-gold">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
      <span className="text-white/75">{text}</span>
    </div>
  )
}
