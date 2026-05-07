import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, AlertTriangle, Info, Gavel, Clock, Inbox } from 'lucide-react'
import { useNotifications, markNotificationRead, markAllNotificationsRead, unreadCount } from '../../lib/store'
import { cn } from '../../lib/utils'

const TYPE_ICON = {
  limitation_warning: { icon: Gavel, cls: 'text-danger' },
  deadline_approaching: { icon: Clock, cls: 'text-warning' },
  pending_review: { icon: Inbox, cls: 'text-info' },
  cis_synced: { icon: Info, cls: 'text-info' },
}

const SEVERITY_TONE = {
  critical: 'border-l-danger',
  warning: 'border-l-warning',
  info: 'border-l-info',
}

export default function NotificationsPanel() {
  const { notifications } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = unreadCount(notifications)

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink ring-1 ring-line transition hover:bg-surface-alt"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" strokeWidth={2.2} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[380px] overflow-hidden rounded-xl bg-surface shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between border-b border-line bg-surface-alt px-4 py-3">
            <div>
              <h3 className="font-serif text-base font-semibold text-ink">Notifications</h3>
              <p className="text-[11px] text-muted">
                {unread > 0 ? `${unread} unread` : 'All caught up'}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 rounded-md bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink ring-1 ring-line hover:bg-surface-alt"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-[480px] divide-y divide-line overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-12 text-center text-sm text-muted">No notifications.</li>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_ICON[n.type] || { icon: Info, cls: 'text-info' }
                const Wrapper = n.link ? Link : 'div'
                const wrapperProps = n.link
                  ? {
                      to: n.link,
                      onClick: () => {
                        markNotificationRead(n.id)
                        setOpen(false)
                      },
                    }
                  : {}
                return (
                  <li key={n.id}>
                    <Wrapper
                      {...wrapperProps}
                      className={cn(
                        'flex items-start gap-3 border-l-4 px-4 py-3 transition',
                        SEVERITY_TONE[n.severity] || 'border-l-line',
                        n.read_at ? 'bg-surface' : 'bg-warning-soft/30',
                        n.link ? 'cursor-pointer hover:bg-surface-alt' : ''
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-surface ring-1 ring-line',
                          meta.cls
                        )}
                      >
                        <meta.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-[13px] leading-snug',
                            n.read_at ? 'text-ink/75' : 'font-medium text-ink'
                          )}
                        >
                          {n.message}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
                          {formatRelative(n.created_at)} · {n.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      {!n.read_at && (
                        <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-warning" />
                      )}
                    </Wrapper>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function formatRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.round((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}
