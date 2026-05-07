import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { useAllCases, useCauseList } from '../lib/store'
import { formatDateLong, daysUntil, deadlineLabel, deadlineTone, cn } from '../lib/utils'

// Aggregate every "important date" across the verified case set.
// Sources:
//   - action.deadline (per action)
//   - appeal_analysis.limitation_deadline
//   - cause_list (hearings)
//
// We only show items from VERIFIED cases (the trusted-data contract).

const TYPE_TONE = {
  action_deadline: 'bg-warning text-warning-soft ring-warning/30',
  limitation: 'bg-danger text-danger-soft ring-danger/30',
  hearing: 'bg-info text-info-soft ring-info/30',
}

const TYPE_BADGE = {
  action_deadline: 'high',
  limitation: 'critical',
  hearing: 'medium',
}

export default function Calendar() {
  const { cases } = useAllCases()
  const { entries: causeList } = useCauseList()
  const [cursor, setCursor] = useState(() => firstOfMonth(new Date()))

  const events = useMemo(() => {
    const arr = []
    for (const c of cases || []) {
      if (c.status !== 'verified') continue
      for (const a of c.actions || []) {
        if (!a.deadline) continue
        arr.push({
          id: `${c.id}-action-${a.id}`,
          date: a.deadline,
          type: 'action_deadline',
          title: a.description,
          subtitle: `${a.responsible_authority} · ${c.case_number}`,
          caseId: c.id,
          priority: a.priority,
        })
      }
      if (c.appeal_analysis?.limitation_deadline) {
        arr.push({
          id: `${c.id}-lim`,
          date: c.appeal_analysis.limitation_deadline,
          type: 'limitation',
          title: `Appeal limitation — ${c.case_number}`,
          subtitle: c.appeal_analysis.limitation_period || c.title,
          caseId: c.id,
          priority: 'critical',
        })
      }
    }
    for (const e of causeList || []) {
      arr.push({
        id: `cl-${e.id}`,
        date: e.hearing_date,
        type: 'hearing',
        title: `Hearing — ${e.case_number}`,
        subtitle: `${e.parties} · ${e.listing_type?.replace('_', ' ') || ''}`,
        caseId: e.case_id,
      })
    }
    return arr
  }, [cases, causeList])

  // Index events by yyyy-mm-dd for fast cell lookup
  const byDay = useMemo(() => {
    const m = new Map()
    for (const e of events) {
      const k = (e.date || '').slice(0, 10)
      if (!k) continue
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(e)
    }
    return m
  }, [events])

  const monthLabel = cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const weeks = buildWeeks(cursor)

  // Upcoming list (next 60 days, sorted)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const horizon = new Date()
  horizon.setDate(today.getDate() + 60)

  const upcoming = events
    .filter((e) => {
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)
      return d >= today && d <= horizon
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analysis"
        title="Important Dates"
        sub="A trust-aware month view of every deadline that matters: action deadlines, appeal limitations, and listed hearings. Verified cases only."
        right={
          <div className="flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold ring-1 ring-gold/30">
            <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.2} />
            {events.length} events
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        {/* Month grid */}
        <section className="rounded-2xl bg-surface shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="font-serif text-lg font-semibold text-ink">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCursor(addMonths(cursor, -1))}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted ring-1 ring-line hover:bg-surface-alt hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCursor(firstOfMonth(new Date()))}
                className="rounded-md px-2.5 py-1 text-[11px] font-semibold ring-1 ring-line hover:bg-surface-alt"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCursor(addMonths(cursor, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted ring-1 ring-line hover:bg-surface-alt hover:text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-line text-[10px] font-semibold uppercase tracking-wider text-muted">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-line">
            {weeks.flat().map((cell) => {
              const inMonth = cell.getMonth() === cursor.getMonth()
              const key = isoDay(cell)
              const dayEvents = byDay.get(key) || []
              const isToday = isoDay(new Date()) === key
              return (
                <div
                  key={key}
                  className={cn(
                    'relative flex min-h-[96px] flex-col gap-0.5 bg-surface p-1.5',
                    !inMonth && 'bg-surface-alt'
                  )}
                >
                  <span
                    className={cn(
                      'self-end font-mono text-[11px]',
                      !inMonth && 'text-muted/60',
                      isToday && 'flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white'
                    )}
                  >
                    {cell.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <Link
                        key={e.id}
                        to={e.caseId ? `/case/${e.caseId}` : '/cause-list'}
                        title={e.title}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full ring-1 transition hover:scale-125',
                          TYPE_TONE[e.type]
                        )}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-muted">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t border-line bg-surface-alt px-5 py-3 text-[11px] text-muted">
            <Legend tone={TYPE_TONE.action_deadline} label="Action deadline" />
            <Legend tone={TYPE_TONE.limitation} label="Appeal limitation" />
            <Legend tone={TYPE_TONE.hearing} label="Hearing" />
          </div>
        </section>

        {/* Upcoming list */}
        <section className="rounded-2xl bg-surface shadow-card ring-1 ring-line">
          <div className="border-b border-line px-5 py-3">
            <h2 className="font-serif text-lg font-semibold text-ink">Next 60 days</h2>
            <p className="text-xs text-muted">Sorted by deadline · soonest first</p>
          </div>
          {upcoming.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted">
              No upcoming events in the next 60 days.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.slice(0, 12).map((e) => {
                const tone = deadlineTone(e.date)
                return (
                  <li key={e.id}>
                    <Link
                      to={e.caseId ? `/case/${e.caseId}` : '/cause-list'}
                      className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-surface-alt"
                    >
                      <DateChip date={e.date} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={TYPE_BADGE[e.type]}>{e.type.replace('_', ' ')}</Badge>
                          <span
                            className={cn(
                              'text-[10px] font-semibold uppercase tracking-wider',
                              tone === 'danger' && 'text-danger',
                              tone === 'warning' && 'text-warning',
                              tone === 'muted' && 'text-muted'
                            )}
                          >
                            {deadlineLabel(e.date)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-ink">{e.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted">{e.subtitle}</p>
                      </div>
                    </Link>
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

function Legend({ tone, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full ring-1', tone)} />
      <span>{label}</span>
    </div>
  )
}

function DateChip({ date }) {
  const d = new Date(date)
  const day = d.getDate()
  const mon = d.toLocaleDateString('en-IN', { month: 'short' })
  const days = daysUntil(date)
  return (
    <div
      className={cn(
        'flex h-12 w-12 flex-none flex-col items-center justify-center rounded-md ring-1',
        days != null && days < 0
          ? 'bg-danger-soft text-danger ring-danger/30'
          : days != null && days <= 7
          ? 'bg-warning-soft text-warning ring-warning/30'
          : 'bg-surface-alt text-ink ring-line'
      )}
    >
      <span className="font-serif text-base font-semibold leading-none">{day}</span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider">{mon}</span>
    </div>
  )
}

// ---------- date helpers ----------
function firstOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1) }
function isoDay(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function buildWeeks(monthAnchor) {
  const first = firstOfMonth(monthAnchor)
  // Start from the Monday on or before the 1st
  const start = new Date(first)
  const offset = (first.getDay() + 6) % 7 // Mon=0 ... Sun=6
  start.setDate(first.getDate() - offset)
  const weeks = []
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start)
      cell.setDate(start.getDate() + w * 7 + d)
      week.push(cell)
    }
    weeks.push(week)
    // Stop after we've passed the end of the month with a full week
    if (week[6].getMonth() !== monthAnchor.getMonth() && week[0].getMonth() !== monthAnchor.getMonth()) break
  }
  return weeks
}
