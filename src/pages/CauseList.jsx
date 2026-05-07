import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ListOrdered, Calendar, ExternalLink } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { useCauseList, useAllCases } from '../lib/store'
import { formatDateLong, cn } from '../lib/utils'

const LISTING_TONE = {
  fresh: 'info',
  admission: 'medium',
  final_hearing: 'warning',
  pronouncement: 'critical',
  compliance_report: 'gold',
}

export default function CauseList() {
  const { entries, loading } = useCauseList()
  const { cases } = useAllCases()

  // Group entries by hearing_date
  const groups = useMemo(() => {
    const map = new Map()
    for (const e of entries) {
      const k = e.hearing_date
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(e)
    }
    // Sort dates ascending; within each date, sort by item_no
    return [...map.entries()]
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, items]) => [date, items.sort((a, b) => (a.item_no ?? 0) - (b.item_no ?? 0))])
  }, [entries])

  const knownCaseIds = new Set((cases || []).map((c) => c.id))

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Daily Cause List"
        sub="Today's and upcoming hearings as fetched from the High Court CIS. Items linked to a JAIS case open the case detail; unlinked entries are awaiting first ingest."
        right={
          <div className="flex items-center gap-2 rounded-full bg-info-soft px-3 py-1.5 text-xs font-semibold text-info ring-1 ring-info/30">
            <ListOrdered className="h-3.5 w-3.5" strokeWidth={2.2} />
            {entries.length} listings
          </div>
        }
      />

      {groups.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center text-sm text-muted ring-1 ring-line">
          No upcoming listings.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([date, items]) => (
            <section
              key={date}
              className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line"
            >
              <header className="flex items-center justify-between border-b border-line bg-surface-alt px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold/10 text-gold ring-1 ring-gold/30">
                    <Calendar className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-ink">
                      {formatDateLong(date)}
                    </h2>
                    <p className="text-xs text-muted">{items.length} item{items.length === 1 ? '' : 's'}</p>
                  </div>
                </div>
              </header>

              <ul className="divide-y divide-line">
                {items.map((e) => {
                  const linked = e.case_id && knownCaseIds.has(e.case_id)
                  return (
                    <li key={e.id}>
                      <Row entry={e} linked={linked} />
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ entry, linked }) {
  const [open, setOpen] = useState(false)

  const Wrapper = linked ? Link : 'button'
  const wrapperProps = linked
    ? { to: `/case/${entry.case_id}` }
    : { type: 'button', onClick: () => setOpen((v) => !v) }

  return (
    <Wrapper
        {...wrapperProps}
        className="group flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-surface-alt"
      >
        <span className="mt-1 flex h-7 w-9 flex-none items-center justify-center rounded-md bg-surface-alt text-[11px] font-mono font-semibold text-ink ring-1 ring-line">
          #{entry.item_no ?? '—'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted">{entry.case_number}</span>
            {entry.listing_type && (
              <Badge variant={LISTING_TONE[entry.listing_type] || 'muted'}>
                {entry.listing_type.replace('_', ' ')}
              </Badge>
            )}
            {linked && <Badge variant="info">In JAIS</Badge>}
            {!linked && <Badge variant="muted">Not yet ingested</Badge>}
          </div>
          <h3 className="mt-1 truncate font-medium text-ink group-hover:underline">
            {entry.parties}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">
            {entry.bench || entry.court}
          </p>
          {entry.remarks && (
            <p className={cn('mt-1 text-xs text-ink/75', !open && 'line-clamp-1')}>
              <span className="font-semibold">Remarks:</span> {entry.remarks}
            </p>
          )}
        </div>
        {linked ? (
          <ExternalLink className="mt-1.5 h-4 w-4 text-muted opacity-0 transition group-hover:opacity-100" />
        ) : (
          <ChevronRight
            className={cn(
              'mt-1.5 h-4 w-4 text-muted transition',
              open && 'rotate-90'
            )}
          />
        )}
    </Wrapper>
  )
}
