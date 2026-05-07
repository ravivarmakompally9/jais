import { Link } from 'react-router-dom'
import { Gavel, Clock, Building2, AlertTriangle, ChevronRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import AIRecommendationBanner from '../components/ui/AIRecommendationBanner'
import { useAllCases } from '../lib/store'
import {
  formatDate,
  deadlineLabel,
  deadlineTone,
  recommendationCopy,
  cn,
} from '../lib/utils'

const TONE_BG = {
  success: 'bg-success-soft border-success/30 text-success',
  warning: 'bg-warning-soft border-warning/30 text-warning',
  danger: 'bg-danger-soft border-danger/30 text-danger',
}

export default function AppealTracker() {
  const { cases, loading } = useAllCases()

  if (loading || !cases) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
  }

  // Verified cases that have an appeal analysis
  const items = cases.filter((c) => c.status === 'verified' && c.appeal_analysis)

  // Sort: strong_consider first, then consider, then no_appeal — but within each
  // group, sort by limitation_deadline ascending so urgent items rise.
  const order = { strong_consider_appeal: 0, consider_appeal: 1, no_appeal: 2 }
  const sorted = [...items].sort((a, b) => {
    const ra = order[a.appeal_analysis.recommendation] ?? 99
    const rb = order[b.appeal_analysis.recommendation] ?? 99
    if (ra !== rb) return ra - rb
    const da = a.appeal_analysis.limitation_deadline
      ? new Date(a.appeal_analysis.limitation_deadline)
      : Infinity
    const db = b.appeal_analysis.limitation_deadline
      ? new Date(b.appeal_analysis.limitation_deadline)
      : Infinity
    return da - db
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analysis"
        title="Appeal Tracker"
        sub="A timeline-aware view of every verified judgment that may warrant an appeal. Limitation deadlines are surfaced with countdowns so nothing slips."
      />

      <AIRecommendationBanner
        title="Decision Support — Not Automation"
        message="Appeal recommendations are AI-generated and have been verified by a human reviewer. The decision to file (or not file) an SLP/appeal rests with the competent authority."
      />

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center text-sm text-muted ring-1 ring-line">
          No verified cases with appeal analysis yet.
        </div>
      ) : (
        <div className="space-y-5">
          {sorted.map((c) => {
            const aa = c.appeal_analysis
            const meta = recommendationCopy[aa.recommendation] || recommendationCopy.no_appeal
            return (
              <article
                key={c.id}
                className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line"
              >
                {/* Top */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-surface-alt px-5 py-4">
                  <Link
                    to={`/case/${c.id}`}
                    className="group flex-1 min-w-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-muted">
                        {c.case_number}
                      </span>
                      {c.dept_role && <Badge variant={c.dept_role}>Govt: {c.dept_role}</Badge>}
                      <Badge variant={c.priority}>{c.priority}</Badge>
                    </div>
                    <h3 className="mt-1 font-serif text-lg font-semibold text-ink group-hover:underline">
                      {c.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {c.department} · order dated {formatDate(c.date_of_order)}
                    </p>
                  </Link>
                  <div
                    className={cn(
                      'rounded-lg border-l-4 px-4 py-2 text-right',
                      TONE_BG[meta.tone]
                    )}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                      Recommendation
                    </div>
                    <div className="font-serif text-sm font-semibold leading-tight">
                      {meta.title}
                    </div>
                  </div>
                </div>

                {/* 3-col info */}
                <div className="grid gap-px bg-line md:grid-cols-3">
                  <Cell icon={Clock} label="Limitation">
                    <p className="text-sm font-medium text-ink">{aa.limitation_period || '—'}</p>
                    {aa.limitation_deadline && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-mono text-xs text-ink">
                          {formatDate(aa.limitation_deadline)}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            deadlineTone(aa.limitation_deadline) === 'danger' &&
                              'bg-danger-soft text-danger',
                            deadlineTone(aa.limitation_deadline) === 'warning' &&
                              'bg-warning-soft text-warning',
                            deadlineTone(aa.limitation_deadline) === 'muted' &&
                              'bg-surface-alt text-muted ring-1 ring-line'
                          )}
                        >
                          {deadlineLabel(aa.limitation_deadline)}
                        </span>
                      </div>
                    )}
                  </Cell>
                  <Cell icon={Building2} label="Appeal Court">
                    <p className="text-sm font-medium text-ink">{aa.appeal_court || '—'}</p>
                  </Cell>
                  <Cell icon={AlertTriangle} label="Risk if No Appeal">
                    <p className="line-clamp-3 text-sm text-ink">{aa.risk_if_no_appeal || '—'}</p>
                  </Cell>
                </div>

                {/* Reasoning + open */}
                <div className="border-t border-line p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    AI Reasoning
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink">{aa.reasoning || '—'}</p>
                  <Link
                    to={`/case/${c.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-info hover:underline"
                  >
                    Open case <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Cell({ icon: Icon, label, children }) {
  return (
    <div className="bg-surface p-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />}
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}
