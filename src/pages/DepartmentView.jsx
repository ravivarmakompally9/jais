import { Link } from 'react-router-dom'
import { Building2, ChevronRight, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { useAllCases } from '../lib/store'
import { formatDate, deadlineLabel, deadlineTone, cn } from '../lib/utils'

export default function DepartmentView() {
  const { cases, loading } = useAllCases()

  if (loading || !cases) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
  }

  // Group only verified cases — trusted dashboard contract
  const verified = cases.filter((c) => c.status === 'verified')
  const groups = new Map()

  for (const c of verified) {
    for (const a of c.actions || []) {
      const dept = a.department || 'Unassigned'
      if (!groups.has(dept)) groups.set(dept, [])
      groups.get(dept).push({ ...a, case: c })
    }
  }

  const departments = [...groups.entries()]
    .map(([dept, actions]) => ({
      dept,
      actions,
      critical: actions.filter((a) => a.priority === 'critical').length,
      high: actions.filter((a) => a.priority === 'high').length,
    }))
    .sort((a, b) => b.actions.length - a.actions.length)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Analysis"
        title="Department View"
        sub="Verified actions grouped by responsible department. Each card shows the workload, the critical/high counts, and the specific officer accountable."
      />

      {departments.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center text-sm text-muted ring-1 ring-line">
          No verified actions yet.
        </div>
      ) : (
        <div className="space-y-6">
          {departments.map(({ dept, actions, critical, high }) => (
            <section
              key={dept}
              className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-alt px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold/10 text-gold ring-1 ring-gold/30">
                    <Building2 className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-ink">{dept}</h2>
                    <p className="text-xs text-muted">
                      {actions.length} action{actions.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {critical > 0 && (
                    <Badge variant="critical" icon={AlertTriangle}>
                      {critical} critical
                    </Badge>
                  )}
                  {high > 0 && <Badge variant="high">{high} high</Badge>}
                </div>
              </header>

              <ul className="divide-y divide-line">
                {actions.map((a) => (
                  <li key={a.id}>
                    <Link
                      to={`/case/${a.case.id}`}
                      className="group flex items-start gap-4 px-5 py-4 transition hover:bg-surface-alt"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={a.priority}>{a.priority}</Badge>
                          <Badge variant={a.nature_of_action}>{a.nature_of_action}</Badge>
                          <span className="font-mono text-[11px] font-semibold text-muted">
                            {a.case.case_number}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-ink group-hover:underline">
                          {a.description}
                        </p>
                        <p className="mt-1 text-[12px] text-muted">
                          Responsible: {a.responsible_authority || '—'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-xs text-ink">{formatDate(a.deadline)}</span>
                        {a.deadline && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                              deadlineTone(a.deadline) === 'danger' && 'bg-danger-soft text-danger',
                              deadlineTone(a.deadline) === 'warning' && 'bg-warning-soft text-warning',
                              deadlineTone(a.deadline) === 'muted' && 'bg-surface-alt text-muted ring-1 ring-line'
                            )}
                          >
                            {deadlineLabel(a.deadline)}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-muted opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
