import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Gavel,
  ListChecks,
  Sparkles,
  Building2,
  CalendarDays,
  Clock,
  FileText,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import ConfidenceBar from '../components/ui/ConfidenceBar'
import SourceQuoteBlock from '../components/ui/SourceQuoteBlock'
import AIRecommendationBanner from '../components/ui/AIRecommendationBanner'
import ActionStatusControls from '../components/ui/ActionStatusControls'
import AuditLog from '../components/ui/AuditLog'
import { useCase } from '../lib/store'
import { useAuth } from '../lib/auth'
import {
  formatDate,
  formatDateLong,
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

export default function CaseDetail() {
  const { id } = useParams()
  const { data, loading } = useCase(id)
  const { user } = useAuth()

  if (loading || !data) {
    return <div className="h-64 animate-pulse rounded-2xl bg-surface-alt" />
  }

  const c = data
  const aa = c.appeal_analysis
  const directions = c.directions || []
  const actions = c.actions || []

  // Officer role is read-only everywhere; reviewers/approvers can move action status post-verification.
  const canTrackActions = user?.role !== 'officer' && c.status === 'verified'

  const completed = actions.filter((a) => a.status === 'completed').length
  const inProgress = actions.filter((a) => a.status === 'in_progress').length
  const total = actions.length
  const pct = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-7">
      <Link
        to="/cases"
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All cases
      </Link>

      <header className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={c.status === 'verified' ? 'verified' : c.status}>{c.status}</Badge>
          {c.priority && <Badge variant={c.priority}>{c.priority}</Badge>}
          {c.dept_role && <Badge variant={c.dept_role}>Govt: {c.dept_role}</Badge>}
          {c.disposal_status && (
            <Badge variant={c.disposal_status}>{c.disposal_status.replace('_', ' ')}</Badge>
          )}
          {c.document_type && <Badge variant={c.document_type}>{c.document_type} pdf</Badge>}
          {c.cis_origin === 'cis_api' && <Badge variant="info">via CIS · {c.cis_diary_no}</Badge>}
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">{c.title}</h1>
        <p className="mt-2 font-mono text-sm text-muted">
          {c.case_number}
          {c.court ? ` · ${c.court}` : ''}
        </p>
        {c.bench && <p className="mt-0.5 text-sm text-muted">{c.bench}</p>}

        {c.status === 'verified' && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-success-soft p-3.5 ring-1 ring-success/30">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-success" strokeWidth={2.2} />
            <div className="text-[13px]">
              <div className="font-semibold text-success">
                Verified by {c.verified_by || '—'} on{' '}
                {c.verified_at ? formatDateLong(c.verified_at) : '—'}.
              </div>
              {c.reviewed_by && (
                <p className="mt-0.5 text-xs text-ink/65">
                  First-reviewed by {c.reviewed_by}
                  {c.reviewed_at ? ` on ${formatDateLong(c.reviewed_at)}` : ''}.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Compliance progress */}
        {c.status === 'verified' && total > 0 && (
          <div className="mt-5 rounded-xl bg-surface-alt p-4 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Compliance progress
              </div>
              <div className="font-mono text-xs font-semibold text-ink">
                {completed}/{total} complete · {inProgress} in progress
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetailTile icon={CalendarDays} label="Date of Order" value={formatDate(c.date_of_order)} mono />
        <DetailTile icon={Building2} label="Department" value={c.department} />
        <DetailTile label="Petitioner" value={c.petitioner} />
        <DetailTile label="Respondent" value={c.respondent} />
      </section>

      {c.summary && (
        <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            Summary
          </h2>
          <p className="mt-2 font-serif text-[17px] leading-relaxed text-ink">{c.summary}</p>
        </section>
      )}

      {/* Court directions */}
      {directions.length > 0 && (
        <section className="space-y-4">
          <SectionTitle icon={ListChecks} eyebrow="Court Directions" title="What the court ordered" />
          <AIRecommendationBanner
            title="AI Extraction"
            message="Each direction below was extracted by Claude and verified by a human reviewer. Source quotes are verbatim from the operative portion of the judgment."
          />
          {directions.map((d, idx) => (
            <div key={d.id} className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Direction {idx + 1}
                </span>
                {d.timeline_type && <Badge variant={d.timeline_type}>{d.timeline_type}</Badge>}
                {d.page_reference != null && <Badge variant="muted">Page {d.page_reference}</Badge>}
              </div>
              <p className="text-[15px] leading-relaxed text-ink">{d.direction_text}</p>
              <div className="mt-4">
                <SourceQuoteBlock quote={d.source_quote} page={d.page_reference} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <KV label="Timeline" value={d.timeline} />
                <KV label="Calculated Deadline" value={formatDate(d.calculated_deadline)} mono />
              </div>
              <div className="mt-4">
                <ConfidenceBar confidence={d.confidence} reason={d.confidence_reason} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Appeal analysis */}
      {aa && (
        <section className="space-y-4">
          <SectionTitle icon={Gavel} eyebrow="Appeal Analysis" title="Limitation, grounds, and risk" />
          <AIRecommendationBanner
            title="AI Recommendation — Decision Support"
            message="This is an AI-generated recommendation. Final decision rests with the competent authority."
          />
          {(() => {
            const meta = recommendationCopy[aa.recommendation] || recommendationCopy.no_appeal
            return (
              <div className={cn('rounded-2xl border-l-4 p-5', TONE_BG[meta.tone])}>
                <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                  Recommendation
                </div>
                <h3 className="mt-1 font-serif text-2xl font-semibold">{meta.title}</h3>
                <p className="mt-2 text-[13px] text-ink/85">{meta.sub}</p>
              </div>
            )
          })()}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
              <KV label="Limitation Period" value={aa.limitation_period} />
              {aa.limitation_deadline && (
                <div className="mt-3 flex items-center justify-between rounded-md bg-surface-alt px-3 py-2 ring-1 ring-line">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted" />
                    <span className="font-mono text-sm">{formatDate(aa.limitation_deadline)}</span>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                      deadlineTone(aa.limitation_deadline) === 'danger' && 'bg-danger-soft text-danger',
                      deadlineTone(aa.limitation_deadline) === 'warning' && 'bg-warning-soft text-warning',
                      deadlineTone(aa.limitation_deadline) === 'muted' && 'bg-surface text-muted ring-1 ring-line'
                    )}
                  >
                    {deadlineLabel(aa.limitation_deadline)}
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
              <KV label="Appeal Court" value={aa.appeal_court} />
            </div>
          </div>

          {aa.grounds && (
            <div className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
              <KV label="Grounds for Appeal" value={aa.grounds} multiline />
            </div>
          )}
          {aa.reasoning && (
            <div className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
              <KV label="AI Reasoning" value={aa.reasoning} multiline />
            </div>
          )}
          {aa.risk_if_no_appeal && (
            <div className="rounded-2xl border-l-4 border-danger bg-danger-soft p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-danger" strokeWidth={2.2} />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-danger">
                    Risk if No Appeal
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink">{aa.risk_if_no_appeal}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Action plan with status tracking */}
      {actions.length > 0 && (
        <section className="space-y-4">
          <SectionTitle icon={Sparkles} eyebrow="Action Plan" title="What needs to happen, and by when" />
          {actions.map((a, idx) => (
            <div key={a.id} className="rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line">
              {/* Dimension 1 — What is required */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Action {idx + 1}
                </span>
                <Badge variant={a.priority}>{a.priority}</Badge>
                <Badge variant={a.action_type}>{a.action_type}</Badge>
                <Badge variant={a.nature_of_action}>{a.nature_of_action}</Badge>
                {a.timeline_type && <Badge variant={a.timeline_type}>{a.timeline_type} timeline</Badge>}
                {a.status && <StatusBadge status={a.status} />}
              </div>
              <p className="text-[15px] leading-relaxed text-ink">{a.description}</p>

              {/* Dimension 2 — Key timeline */}
              <div className="mt-4 rounded-lg bg-surface-alt p-4 ring-1 ring-line">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <Clock className="h-3 w-3" />
                  Key timeline · {a.timeline_type || 'unspecified'}
                </div>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <KV label="Timeline narrative" value={a.timeline} />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Deadline
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-sm text-ink">{formatDate(a.deadline)}</span>
                      {a.deadline && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            deadlineTone(a.deadline) === 'danger' && 'bg-danger-soft text-danger',
                            deadlineTone(a.deadline) === 'warning' && 'bg-warning-soft text-warning',
                            deadlineTone(a.deadline) === 'muted' && 'bg-surface text-muted ring-1 ring-line'
                          )}
                        >
                          {deadlineLabel(a.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimension 3 — Responsible department */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <KV label="Department" value={a.department} />
                <KV label="Responsible Authority" value={a.responsible_authority} />
              </div>

              {/* Action status controls (post-verification compliance tracking) */}
              <div className="mt-5 border-t border-line pt-4">
                <ActionStatusControls caseId={c.id} action={a} readOnly={!canTrackActions} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Audit log */}
      <SectionTitle icon={FileText} eyebrow="Audit Trail" title="Who did what, when" />
      <AuditLog caseId={c.id} />
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'completed') return <Badge variant="success">Completed</Badge>
  if (status === 'in_progress') return <Badge variant="warning">In progress</Badge>
  return <Badge variant="muted">Pending</Badge>
}

function DetailTile({ icon: Icon, label, value, mono }) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-soft ring-1 ring-line">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />}
        {label}
      </div>
      <p className={cn('mt-2 text-sm font-medium text-ink', mono && 'font-mono')}>
        {value || '—'}
      </p>
    </div>
  )
}

function KV({ label, value, mono, multiline }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <p
        className={cn(
          'mt-1 text-[14px] text-ink',
          mono && 'font-mono',
          multiline && 'leading-relaxed whitespace-pre-wrap'
        )}
      >
        {value || '—'}
      </p>
    </div>
  )
}

function SectionTitle({ icon: Icon, eyebrow, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold/10 text-gold ring-1 ring-gold/30">
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          {eyebrow}
        </div>
        <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
      </div>
    </div>
  )
}
