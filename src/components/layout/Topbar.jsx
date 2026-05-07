import { useEffect, useRef, useState } from 'react'
import { Search, ChevronDown, LogOut, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import NotificationsPanel from './NotificationsPanel'
import { cn } from '../../lib/utils'

const ROLE_LABEL = {
  approver: 'Approver',
  reviewer: 'Reviewer',
  officer: 'Officer',
}

const ROLE_TONE = {
  approver: 'bg-success-soft text-success ring-success/30',
  reviewer: 'bg-info-soft text-info ring-info/30',
  officer: 'bg-surface-alt text-muted ring-line',
}

export default function Topbar() {
  const { user, logout, switchRole, isSupabaseConfigured } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const onLogout = async () => {
    await logout()
    nav('/login', { replace: true })
  }

  const onQuickSearch = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')
    nav(`/cases?q=${encodeURIComponent(q || '')}`)
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-6 backdrop-blur">
      <form onSubmit={onQuickSearch} className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          name="q"
          placeholder="Search cases by number, title, department…"
          className="w-full rounded-md bg-surface py-2 pl-9 pr-3 text-sm text-ink ring-1 ring-line focus:bg-white focus:outline-none focus:ring-gold/50"
        />
      </form>

      <div className="flex items-center gap-3">
        <NotificationsPanel />

        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 ring-1 ring-line hover:bg-surface-alt"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar text-[11px] font-semibold text-white">
              {initials(user?.name)}
            </span>
            <div className="hidden text-left leading-tight md:block">
              <div className="text-[12px] font-semibold text-ink">{user?.name || 'Demo'}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted">
                {user?.designation || (user ? 'Reviewer' : 'Demo Mode')}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted" strokeWidth={2.2} />
          </button>

          {open && (
            <div className="absolute right-0 top-11 z-30 w-[260px] overflow-hidden rounded-xl bg-surface shadow-card ring-1 ring-line">
              <div className="border-b border-line px-4 py-3">
                <div className="text-[13px] font-semibold text-ink">{user?.name}</div>
                <div className="text-[11px] text-muted">{user?.email}</div>
                <div className="mt-2 inline-flex items-center gap-1">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1',
                      ROLE_TONE[user?.role] || ROLE_TONE.reviewer
                    )}
                  >
                    {ROLE_LABEL[user?.role] || 'Reviewer'}
                  </span>
                </div>
              </div>

              {!isSupabaseConfigured && (
                <div className="border-b border-line px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    <UserCog className="h-3 w-3" /> Switch role (demo)
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {Object.keys(ROLE_LABEL).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          switchRole(r)
                          setOpen(false)
                        }}
                        className={cn(
                          'rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition',
                          user?.role === r
                            ? 'bg-ink text-white ring-ink'
                            : 'bg-surface text-ink ring-line hover:bg-surface-alt'
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-ink hover:bg-surface-alt"
              >
                <LogOut className="h-4 w-4 text-muted" strokeWidth={2.2} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function initials(name) {
  if (!name) return 'CC'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
