import { Link } from 'react-router-dom'
import {
  FileText,
  AlertTriangle,
  Gavel,
  ArrowRight,
  Clock3,
  Building2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import PriorityDot from '../components/ui/PriorityDot'
import { useAllCases } from '../lib/store'
import { formatDate, daysUntil, deadlineLabel, cn } from '../lib/utils'

export default function Dashboard() {
  const { cases, loading } = useAllCases()

  if (loading || !cases) {
    return <PageSkeleton />
  }

  const verified = cases.filter((c) => c.status === 'verified')
  const pending = cases.filter((c) => c.status === 'pending')
  const reviewed = cases.filter((c) => c.status === 'reviewed')

  const allActions = verified.flatMap((c) => (c.actions || []).map((a) => ({ ...a, case: c })))
  const criticalActions = allActions.filter((a) => a.priority === 'critical')
  const completedActions = allActions.filter((a) => a.status === 'completed')
  const compliancePct = allActions.length
    ? Math.round((completedActions.length / allActions.length) * 100)
    : 0

  const appealConsiderations = verified.filter(
    (c) => c.appeal_analysis && c.appeal_analysis.recommendation !== 'no_appeal'
  )

  const upcoming = [...allActions]
    .filter((a) => a.deadline && a.status !== 'completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 6)

  const recent = [...verified]
    .sort((a, b) => new Date(b.verified_at || b.created_at) - new Date(a.verified_at || a.created_at))
    .slice(0, 6)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Centre for e-Governance"
        title="Court Case Monitoring System"
        sub="A trusted overview of verified judgments and the actions they require. AI accelerates the read; humans approve every record before it appears here."
        right={
          <div className="flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success ring-1 ring-success/30">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
            Verified data only
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          tone="blue"
          label="Total Cases"
          value={cases.length}
          sub={`${verified.length} verified · ${pending.length + reviewed.length} in review`}
        />
        <StatCard
          icon={AlertTriangle}
          tone="red"
          label="Critical Actions"
          value={criticalActions.length}
          sub={`${criticalActions.filter((a) => a.status !== 'completed').length} still open`}
        />
        <StatCard
          icon={Gavel}
          tone="amber"
          label="Appeal Decisions"
          value={appealConsiderations.length}
          sub="Pending appeal consideration"
        />
        <StatCard
          icon={TrendingUp}
          tone="green"
          label="Compliance"
          value={`${compliancePct}%`}
          sub={`${completedActions.length} of ${allActions.length} actions completed`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <section className="rounded-2xl bg-surface shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-ink">Recent Cases</h2>
              <p className="mt-0.5 text-xs text-muted">Verified judgments, latest first</p>
            </div>
            <Link
              to="/cases"
              className="inline-flex items-center gap-1 text-xs font-semibold text-info hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyHint
              text="No verified cases yet. Upload and approve a judgment to populate this dashboard."
            />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((c) => {
                const acts = c.actions || []
                const done = acts.filter((a) => a.status === 'completed').length
                const pct = acts.length ? Math.round((done / acts.length) * 100) : 0
                return (
                  <li key={c.id}>
                    <Link
                      to={`/case/${c.id}`}
                      className="group flex items-start gap-3 px-5 py-4 transition hover:bg-surface-alt"
                    >
                      <PriorityDot priority={c.priority} className="mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-muted">{c.case_number}</span>
                          {c.dept_role && <Badge variant={c.dept_role}>{c.dept_role}</Badge>}
                          {c.cis_origin === 'cis_api' && <Badge variant="info">CIS</Badge>}
                        </div>
                        <h3 className="mt-1 truncate font-medium text-ink group-hover:underline">
                          {c.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted">
                          {c.department} · {formatDate(c.date_of_order)} · {pct}% complete
                        </p>
                      </div>
                      <Badge variant={c.priority}>{c.priority}</Badge>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-surface shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-ink">Upcoming Deadlines</h2>
              <p className="mt-0.5 text-xs text-muted">Open actions · soonest first</p>
            </div>
            <Clock3 className="h-4 w-4 text-muted" strokeWidth={2.2} />
          </div>
          {upcoming.length === 0 ? (
            <EmptyHint text="No active deadlines." />
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((a) => {
                const days = daysUntil(a.deadline)
                const overdue = days != null && days < 0
                const close = days != null && days <= 30 && days >= 0
                return (
                  <li key={a.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] font-semibold text-muted">
                        {a.case.case_number}
                      </span>
                      <span
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-wider',
                          overdue ? 'text-danger' : close ? 'text-warning' : 'text-muted'
                        )}
                      >
                        {deadlineLabel(a.deadline)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink">{a.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={a.nature_of_action}>{a.nature_of_action}</Badge>
                      {a.status === 'in_progress' && <Badge variant="warning">In progress</Badge>}
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                        <Building2 className="h-3 w-3" />
                        {a.responsible_authority}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function EmptyHint({ text }) {
  return <div className="px-5 py-10 text-center text-sm text-muted">{text}</div>
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 rounded-lg bg-surface-alt animate-pulse" />
      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-surface-alt animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="h-96 rounded-2xl bg-surface-alt animate-pulse" />
        <div className="h-96 rounded-2xl bg-surface-alt animate-pulse" />
      </div>
    </div>
  )
}
