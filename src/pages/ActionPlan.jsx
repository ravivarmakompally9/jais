import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ListChecks,
  Sparkles,
  ArrowRight,
  CalendarClock,
  ShieldCheck,
  Gavel,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { useAllCases, setActionStatus } from '../lib/store'
import { useAuth, actorTag } from '../lib/auth'
import { formatDate, daysUntil, deadlineLabel, cn } from '../lib/utils'

const COLUMNS = [
  {
    id: 'pending',
    label: 'Pending',
    icon: Clock,
    tone: 'bg-surface-alt/60',
    headTone: 'text-muted',
    dot: 'bg-muted',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    icon: PlayCircle,
    tone: 'bg-warning-soft/40',
    headTone: 'text-warning',
    dot: 'bg-warning',
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    tone: 'bg-success-soft/40',
    headTone: 'text-success',
    dot: 'bg-success',
  },
]

const FILTER_DEFS = [
  {
    key: 'priority',
    label: 'Priority',
    options: [
      { value: 'all', label: 'All' },
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
  {
    key: 'type',
    label: 'What is required',
    options: [
      { value: 'all', label: 'All' },
      { value: 'compliance', label: 'Compliance' },
      { value: 'appeal_consideration', label: 'Appeal' },
    ],
  },
  {
    key: 'nature',
    label: 'Nature',
    options: [
      { value: 'all', label: 'All' },
      { value: 'financial', label: 'Financial' },
      { value: 'administrative', label: 'Administrative' },
      { value: 'legal', label: 'Legal' },
      { value: 'regulatory', label: 'Regulatory' },
    ],
  },
  {
    key: 'timelineType',
    label: 'Timeline',
    options: [
      { value: 'all', label: 'All' },
      { value: 'explicit', label: 'Explicit' },
      { value: 'inferred', label: 'Inferred' },
    ],
  },
]

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

export default function ActionPlan() {
  const { cases, loading } = useAllCases()
  const { user } = useAuth()

  const [filters, setFilters] = useState({
    priority: 'all',
    type: 'all',
    nature: 'all',
    timelineType: 'all',
    department: 'all',
  })

  const allActions = useMemo(() => {
    if (!cases) return []
    return cases
      .filter((c) => c.status === 'verified')
      .flatMap((c) => (c.actions || []).map((a) => ({ ...a, case: c })))
  }, [cases])

  const departments = useMemo(() => {
    const set = new Set(allActions.map((a) => a.department).filter(Boolean))
    return ['all', ...[...set].sort()]
  }, [allActions])

  const filtered = useMemo(() => {
    return allActions.filter((a) => {
      if (filters.priority !== 'all' && a.priority !== filters.priority) return false
      if (filters.type !== 'all' && a.action_type !== filters.type) return false
      if (filters.nature !== 'all' && a.nature_of_action !== filters.nature) return false
      if (filters.timelineType !== 'all' && a.timeline_type !== filters.timelineType) return false
      if (filters.department !== 'all' && a.department !== filters.department) return false
      return true
    })
  }, [allActions, filters])

  const grouped = useMemo(() => {
    const m = { pending: [], in_progress: [], completed: [] }
    for (const a of filtered) {
      const k = a.status || 'pending'
      if (m[k]) m[k].push(a)
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => {
        const dp = (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
        if (dp !== 0) return dp
        return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31')
      })
    }
    return m
  }, [filtered])

  const overdueCount = filtered.filter((a) => {
    if (a.status === 'completed') return false
    if (!a.deadline) return false
    return daysUntil(a.deadline) < 0
  }).length

  const compliancePct = filtered.length
    ? Math.round((grouped.completed.length / filtered.length) * 100)
    : 0

  const canEdit = user?.role !== 'officer'

  if (loading || !cases) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow · Step 3"
        title="Action Plan"
        sub="The core differentiator — every required action across verified cases, structured around the four spec dimensions: what is required, key timelines, responsible departments, and nature of action."
        right={
          <div className="flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold ring-1 ring-gold/30">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
            {filtered.length} actions
          </div>
        }
      />

      {/* Spec dimensions strip — explicit map of how the page reflects the requirements */}
      <SpecDimensionsLegend />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={ListChecks} tone="blue" label="Total" value={filtered.length} sub="Across verified cases" />
        <StatCard icon={Clock} tone="gold" label="Pending" value={grouped.pending.length} sub="Awaiting first action" />
        <StatCard icon={PlayCircle} tone="amber" label="In progress" value={grouped.in_progress.length} sub="Currently being executed" />
        <StatCard icon={CheckCircle2} tone="green" label="Completed" value={grouped.completed.length} sub={`${compliancePct}% compliance`} />
        <StatCard
          icon={AlertTriangle}
          tone={overdueCount > 0 ? 'red' : 'gold'}
          label="Overdue"
          value={overdueCount}
          sub={overdueCount > 0 ? 'Past deadline · escalate' : 'Nothing past deadline'}
        />
      </div>

      {/* Filters */}
      <section className="rounded-2xl bg-surface p-4 shadow-soft ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {FILTER_DEFS.map((f) => (
            <FilterChipGroup
              key={f.key}
              label={f.label}
              value={filters[f.key]}
              onChange={(v) => setFilters((s) => ({ ...s, [f.key]: v }))}
              options={f.options}
            />
          ))}
          <FilterChipGroup
            label="Department"
            value={filters.department}
            onChange={(v) => setFilters((s) => ({ ...s, department: v }))}
            options={departments.map((d) => ({ value: d, label: d === 'all' ? 'All' : d }))}
          />
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center text-sm text-muted ring-1 ring-line">
          No actions match the current filters.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column key={col.id} col={col} actions={grouped[col.id]} canEdit={canEdit} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}

// =====================================================================
// Spec dimensions legend — a small explainer block tying the visual
// language of the cards back to the four "Generate Action Plan" sub-bullets
// from the problem statement.
// =====================================================================
function SpecDimensionsLegend() {
  return (
    <div className="grid gap-3 rounded-2xl bg-surface p-4 shadow-soft ring-1 ring-line md:grid-cols-4">
      <Dim
        icon={ShieldCheck}
        title="What is required"
        text="Each action is tagged Compliance or Appeal-Consideration."
      />
      <Dim
        icon={CalendarClock}
        title="Key timelines"
        text="Each timeline is labelled Explicit (court-fixed) or Inferred (derived)."
      />
      <Dim
        icon={Building2}
        title="Responsible department"
        text="Department + specific officer designation on every action."
      />
      <Dim
        icon={Gavel}
        title="Nature of action"
        text="Financial / Administrative / Legal / Regulatory."
      />
    </div>
  )
}

function Dim({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-2.5 rounded-md bg-surface-alt px-3 py-2.5 ring-1 ring-line">
      <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md bg-gold/10 text-gold ring-1 ring-gold/30">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink">{title}</div>
        <p className="text-[11px] leading-snug text-muted">{text}</p>
      </div>
    </div>
  )
}

// =====================================================================
// Column
// =====================================================================
function Column({ col, actions, canEdit, user }) {
  return (
    <section className="flex flex-col rounded-2xl ring-1 ring-line">
      <header className={cn('flex items-center justify-between rounded-t-2xl border-b border-line px-4 py-3', col.tone)}>
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', col.dot)} />
          <col.icon className={cn('h-4 w-4', col.headTone)} strokeWidth={2.2} />
          <h3 className={cn('font-serif text-base font-semibold', col.headTone)}>{col.label}</h3>
        </div>
        <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-xs font-semibold text-ink ring-1 ring-line">
          {actions.length}
        </span>
      </header>

      <div className="flex-1 space-y-3 rounded-b-2xl bg-surface/60 p-3">
        {actions.length === 0 ? (
          <div className="rounded-md bg-surface px-3 py-8 text-center text-xs text-muted ring-1 ring-line">
            Nothing here.
          </div>
        ) : (
          actions.map((a) => (
            <ActionCard key={a.id} action={a} canEdit={canEdit} user={user} colId={col.id} />
          ))
        )}
      </div>
    </section>
  )
}

// =====================================================================
// Card — explicit sections for the four spec dimensions
// =====================================================================
const NEXT_STATUS = {
  pending: { value: 'in_progress', label: 'Start' },
  in_progress: { value: 'completed', label: 'Mark done' },
  completed: { value: 'in_progress', label: 'Reopen' },
}

const PREV_STATUS = {
  in_progress: { value: 'pending', label: 'Move to pending' },
  completed: { value: 'in_progress', label: 'Move to in progress' },
}

function ActionCard({ action: a, canEdit, user, colId }) {
  const days = daysUntil(a.deadline)
  const overdue = a.status !== 'completed' && days != null && days < 0
  const close = a.status !== 'completed' && days != null && days <= 14 && days >= 0

  const move = async (newStatus) => {
    if (!canEdit) return
    await setActionStatus(a.case.id, a.id, newStatus, actorTag(user))
  }

  const next = NEXT_STATUS[colId]
  const prev = PREV_STATUS[colId]

  return (
    <article
      className={cn(
        'group rounded-xl bg-surface p-3.5 shadow-soft ring-1 transition hover:shadow-card',
        overdue ? 'ring-danger/30' : close ? 'ring-warning/30' : 'ring-line'
      )}
    >
      {/* Dimension 1 — What is required (priority + type) */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        <Badge variant={a.priority}>{a.priority}</Badge>
        <Badge variant={a.action_type}>
          {a.action_type === 'compliance' ? 'Compliance' : 'Appeal'}
        </Badge>
      </div>

      {/* Description */}
      <p className="line-clamp-3 text-sm leading-snug text-ink">{a.description}</p>

      {/* Dimension 2 — Key timeline (explicit/inferred) */}
      <div className="mt-3 rounded-md bg-surface-alt/70 px-2.5 py-2 ring-1 ring-line">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <CalendarClock className="h-3 w-3" />
            Timeline
          </div>
          {a.timeline_type && <Badge variant={a.timeline_type}>{a.timeline_type}</Badge>}
        </div>
        {a.timeline && (
          <p className="mt-1 text-[12px] leading-snug text-ink">{a.timeline}</p>
        )}
        {a.deadline && (
          <div className="mt-1.5 flex items-center justify-between">
            <span className="font-mono text-[11px] text-ink/70">{formatDate(a.deadline)}</span>
            <span
              className={cn(
                'font-mono text-[11px]',
                overdue ? 'font-semibold text-danger' : close ? 'font-semibold text-warning' : 'text-ink/70'
              )}
            >
              {deadlineLabel(a.deadline)}
            </span>
          </div>
        )}
      </div>

      {/* Dimension 3 — Responsible department + officer */}
      <div className="mt-2 flex items-start gap-1.5 px-0.5">
        <Building2 className="mt-0.5 h-3 w-3 flex-none text-muted" />
        <div className="min-w-0 text-[11.5px] leading-snug">
          <div className="font-medium text-ink">{a.responsible_authority || '—'}</div>
          <div className="text-muted">{a.department || '—'}</div>
        </div>
      </div>

      {/* Dimension 4 — Nature of action */}
      <div className="mt-2 flex items-center gap-1.5 px-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Nature</span>
        {a.nature_of_action && <Badge variant={a.nature_of_action}>{a.nature_of_action}</Badge>}
      </div>

      {/* Source case + completion note */}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <Link
          to={`/case/${a.case.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-[11px] font-semibold text-info hover:underline"
        >
          {a.case.case_number}
        </Link>
        {a.completion_note && (
          <span className="ml-2 truncate text-[11px] italic text-ink/65" title={a.completion_note}>
            “{a.completion_note}”
          </span>
        )}
      </div>

      {/* Status transitions */}
      {canEdit && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 opacity-70 transition group-hover:opacity-100">
          {prev && (
            <button
              type="button"
              onClick={() => move(prev.value)}
              className="rounded-md bg-surface-alt px-2 py-1 text-[10px] font-semibold text-muted ring-1 ring-line transition hover:bg-surface hover:text-ink"
              title={prev.label}
            >
              ← back
            </button>
          )}
          {next && (
            <button
              type="button"
              onClick={() => move(next.value)}
              className={cn(
                'ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ring-1 transition',
                colId === 'completed'
                  ? 'bg-surface-alt text-muted ring-line hover:bg-surface'
                  : 'bg-ink text-white ring-ink hover:bg-sidebar'
              )}
              title={next.label}
            >
              {next.label} <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </article>
  )
}

// =====================================================================
// Filter chip group
// =====================================================================
function FilterChipGroup({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-semibold transition',
                active
                  ? 'bg-ink text-white'
                  : 'bg-surface-alt text-muted ring-1 ring-line hover:bg-surface hover:text-ink'
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
