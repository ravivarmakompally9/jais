import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import ReviewCard from '../components/review/ReviewCard'
import { useAllCases } from '../lib/store'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/utils'

const TABS = [
  { id: 'all', label: 'All open' },
  { id: 'pending', label: 'Awaiting first review' },
  { id: 'reviewed', label: 'Awaiting approver' },
]

export default function Review() {
  const { cases, loading } = useAllCases()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const focusId = params.get('focus')
  const [resolvedNote, setResolvedNote] = useState(null)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    if (resolvedNote) {
      const t = setTimeout(() => setResolvedNote(null), 4000)
      return () => clearTimeout(t)
    }
  }, [resolvedNote])

  const open = useMemo(() => {
    if (!cases) return []
    return cases.filter((c) => c.status === 'pending' || c.status === 'reviewed')
  }, [cases])

  const filtered = useMemo(() => {
    let arr = open
    if (tab !== 'all') arr = arr.filter((c) => c.status === tab)
    if (focusId) {
      arr = [...arr].sort((a, b) => (a.id === focusId ? -1 : b.id === focusId ? 1 : 0))
    }
    return arr
  }, [open, tab, focusId])

  if (loading || !cases) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
  }

  const counts = {
    all: open.length,
    pending: open.filter((c) => c.status === 'pending').length,
    reviewed: open.filter((c) => c.status === 'reviewed').length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow · Step 2"
        title="Review & Verify"
        sub="Mandatory human-in-the-loop checkpoint. Reviewers do the first pass; approvers do the final sign-off. Edits are audit-logged automatically."
        right={
          <div className="flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1.5 text-xs font-semibold text-warning ring-1 ring-warning/30">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
            {open.length} open · role: {user?.role || 'reviewer'}
          </div>
        }
      />

      {/* Stage filter */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-surface p-2 shadow-soft ring-1 ring-line">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                active ? 'bg-ink text-white' : 'text-muted hover:bg-surface-alt hover:text-ink'
              )}
            >
              {t.label}
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                  active ? 'bg-white/15 text-white' : 'bg-surface-alt text-muted'
                )}
              >
                {counts[t.id] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {resolvedNote && (
        <div className="flex items-center gap-2 rounded-lg bg-success-soft p-3 text-sm font-medium text-success ring-1 ring-success/30">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
          {resolvedNote}
        </div>
      )}

      {filtered.length === 0 ? (
        <AllCaughtUp />
      ) : (
        <div className="space-y-8">
          {filtered.map((c) => (
            <ReviewCard
              key={c.id}
              caseData={c}
              onResolved={(status) =>
                setResolvedNote(
                  status === 'verified'
                    ? `Case ${c.case_number} approved and now visible on the trusted dashboard.`
                    : status === 'reviewed'
                    ? `Case ${c.case_number} marked reviewed. Waiting on approver sign-off.`
                    : `Case ${c.case_number} rejected. It will not appear on the dashboard.`
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AllCaughtUp() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-surface p-12 text-center shadow-card ring-1 ring-line">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success ring-1 ring-success/30">
        <CheckCircle2 className="h-7 w-7" strokeWidth={2.2} />
      </span>
      <h3 className="mt-5 font-serif text-2xl font-semibold text-ink">All caught up!</h3>
      <p className="mt-2 max-w-md text-sm text-muted">
        Nothing in this queue. Try the other tabs above, or sync with CIS / upload a new judgment.
      </p>
      <Link
        to="/upload"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-sidebar"
      >
        Upload or CIS Sync <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
