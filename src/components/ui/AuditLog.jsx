import { History, Pencil, CheckCheck, XCircle, ShieldCheck, Activity } from 'lucide-react'
import { useAuditLog } from '../../lib/store'
import { formatDate, cn } from '../../lib/utils'

const ACTION_META = {
  edit: { icon: Pencil, label: 'Edit', tone: 'text-info' },
  reviewed: { icon: CheckCheck, label: 'Reviewed', tone: 'text-info' },
  approved: { icon: ShieldCheck, label: 'Approved', tone: 'text-success' },
  rejected: { icon: XCircle, label: 'Rejected', tone: 'text-danger' },
  status_changed: { icon: Activity, label: 'Status', tone: 'text-warning' },
}

export default function AuditLog({ caseId, max = null }) {
  const { entries, loading } = useAuditLog(caseId)

  if (loading) {
    return <div className="h-24 animate-pulse rounded-xl bg-surface-alt" />
  }

  // Newest first
  const sorted = [...entries].sort(
    (a, b) => new Date(b.performed_at) - new Date(a.performed_at)
  )
  const list = max ? sorted.slice(0, max) : sorted

  return (
    <section className="rounded-2xl bg-surface shadow-card ring-1 ring-line">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <History className="h-4 w-4 text-muted" strokeWidth={2.2} />
          <div>
            <h3 className="font-serif text-base font-semibold text-ink">Audit log</h3>
            <p className="text-[11px] text-muted">
              Every edit, review action, and status change. Tamper-resistant trail.
            </p>
          </div>
        </div>
        <span className="text-[11px] text-muted">{entries.length} entries</span>
      </div>

      {list.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted">
          No audit entries yet. Edits and workflow actions will appear here.
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {list.map((e) => {
            const meta = ACTION_META[e.action] || ACTION_META.edit
            return (
              <li key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-surface-alt ring-1 ring-line',
                    meta.tone
                  )}
                >
                  <meta.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {meta.label}
                    </span>
                    {e.entity_table && (
                      <span className="font-mono text-[10px] text-muted">
                        {e.entity_table}
                        {e.field_name ? `.${e.field_name}` : ''}
                      </span>
                    )}
                  </div>

                  {e.action === 'edit' && (
                    <div className="mt-1 text-[13px] leading-snug text-ink">
                      <span className="block max-w-2xl">
                        <span className="bg-danger-soft/60 px-1 line-through decoration-danger/60">
                          {truncate(e.old_value, 120) || '—'}
                        </span>{' '}
                        →{' '}
                        <span className="bg-success-soft/60 px-1">
                          {truncate(e.new_value, 120) || '—'}
                        </span>
                      </span>
                    </div>
                  )}
                  {e.action === 'status_changed' && (
                    <div className="mt-0.5 text-[13px] text-ink">
                      Marked as <strong>{e.new_value}</strong>
                    </div>
                  )}
                  {(e.action === 'reviewed' ||
                    e.action === 'approved' ||
                    e.action === 'rejected') && (
                    <div className="mt-0.5 text-[13px] text-ink">
                      Workflow transition recorded.
                    </div>
                  )}

                  <p className="mt-1 text-[11px] text-muted">
                    {e.performed_by || 'Unknown'} · {formatDate(e.performed_at)}{' '}
                    {timeOnly(e.performed_at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function truncate(s, n) {
  if (s == null) return s
  return s.length > n ? s.slice(0, n) + '…' : s
}

function timeOnly(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
