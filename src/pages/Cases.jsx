import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import PriorityDot from '../components/ui/PriorityDot'
import { useAllCases } from '../lib/store'
import { formatDate, cn } from '../lib/utils'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified' },
  { id: 'pending', label: 'Pending' },
  { id: 'rejected', label: 'Rejected' },
]

const STATUS_ICON = {
  verified: { icon: CheckCircle2, cls: 'text-success' },
  pending: { icon: Clock, cls: 'text-warning' },
  rejected: { icon: XCircle, cls: 'text-danger' },
}

export default function Cases() {
  const { cases, loading } = useAllCases()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const list = useMemo(() => {
    if (!cases) return []
    let arr = cases
    if (filter !== 'all') arr = arr.filter((c) => c.status === filter)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      arr = arr.filter(
        (c) =>
          c.case_number?.toLowerCase().includes(needle) ||
          c.title?.toLowerCase().includes(needle) ||
          c.department?.toLowerCase().includes(needle)
      )
    }
    return arr
  }, [cases, q, filter])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="All Cases"
        sub="Every judgment in the system, regardless of status. Search by case number, title, or department."
      />

      {/* Filters + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-3 shadow-soft ring-1 ring-line">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => {
            const active = filter === f.id
            const count =
              f.id === 'all'
                ? cases?.length || 0
                : cases?.filter((c) => c.status === f.id).length || 0
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-ink text-white'
                    : 'text-muted hover:bg-surface-alt hover:text-ink'
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                    active ? 'bg-white/15 text-white' : 'bg-surface-alt text-muted'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cases…"
            className="w-full rounded-md bg-surface-alt py-2 pl-9 pr-3 text-sm text-ink ring-1 ring-line focus:bg-white focus:outline-none focus:ring-gold/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface shadow-card ring-1 ring-line">
        {loading ? (
          <div className="space-y-1 p-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-surface-alt" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-muted">
            No cases match the current filter.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((c) => {
              const s = STATUS_ICON[c.status] || STATUS_ICON.pending
              return (
                <li key={c.id}>
                  <Link
                    to={`/case/${c.id}`}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-surface-alt"
                  >
                    <s.icon className={cn('h-4 w-4 flex-none', s.cls)} strokeWidth={2.2} />
                    <PriorityDot priority={c.priority} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted">
                          {c.case_number}
                        </span>
                        {c.dept_role && <Badge variant={c.dept_role}>{c.dept_role}</Badge>}
                        {c.disposal_status && (
                          <Badge variant={c.disposal_status}>
                            {c.disposal_status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-1 truncate font-medium text-ink group-hover:underline">
                        {c.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {c.department} · {formatDate(c.date_of_order)}
                      </p>
                    </div>
                    <Badge variant={c.priority}>{c.priority}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
