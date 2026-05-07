import { useState } from 'react'
import {
  ShieldCheck,
  X as XIcon,
  Check,
  FileText,
  Gavel,
  ListChecks,
  Eye,
  Sparkles,
  AlertTriangle,
  Columns2,
  Rows3,
  CheckCheck,
  History,
} from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import AIRecommendationBanner from '../ui/AIRecommendationBanner'
import CaseDetailsTab from './CaseDetailsTab'
import DirectionsTab from './DirectionsTab'
import AppealAnalysisTab from './AppealAnalysisTab'
import ActionPlanTab from './ActionPlanTab'
import PdfViewerTab from './PdfViewerTab'
import { approveCase, rejectCase, markReviewed } from '../../lib/store'
import { useAuth, actorTag } from '../../lib/auth'
import { cn, confidenceTone } from '../../lib/utils'

const TABS = [
  { id: 'details', label: 'Case Details', icon: FileText },
  { id: 'directions', label: 'Court Directions', icon: ListChecks },
  { id: 'appeal', label: 'Appeal Analysis', icon: Gavel },
  { id: 'actions', label: 'Action Plan', icon: Sparkles },
  { id: 'pdf', label: 'Source PDF', icon: Eye },
]

const QUALITY_RING = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted',
}

export default function ReviewCard({ caseData, onResolved }) {
  const c = caseData
  const { user } = useAuth()
  const [tab, setTab] = useState('details')
  const [busy, setBusy] = useState(null)
  const [split, setSplit] = useState(true)
  const [activeDirection, setActiveDirection] = useState(null)

  const role = user?.role || 'reviewer'
  const canReview = role === 'reviewer' || role === 'approver'
  const canApprove = role === 'approver'
  const stage = c.status // 'pending' | 'reviewed' | 'verified' | 'rejected'

  const quality = c.extraction_quality || 0
  const tone = confidenceTone(quality)
  const by = actorTag(user)

  const onMarkReviewed = async () => {
    setBusy('review')
    try {
      await markReviewed(c.id, by)
      onResolved?.('reviewed', c.id)
    } finally {
      setBusy(null)
    }
  }

  const onApprove = async () => {
    setBusy('approve')
    try {
      await approveCase(c.id, by)
      onResolved?.('verified', c.id)
    } finally {
      setBusy(null)
    }
  }

  const onReject = async () => {
    setBusy('reject')
    try {
      await rejectCase(c.id, by)
      onResolved?.('rejected', c.id)
    } finally {
      setBusy(null)
    }
  }

  const onJumpToSource = (direction) => {
    setActiveDirection(direction.id)
    if (!split) setTab('pdf')
  }

  // Pass through to children: should the form be read-only?
  // Reviewer can edit a pending case; Approver can edit pending or reviewed.
  const readOnly =
    !canReview ||
    (stage === 'reviewed' && !canApprove) ||
    stage === 'verified' ||
    stage === 'rejected'

  // Renders the active tab's content
  const tabContent = (() => {
    if (tab === 'details') return <CaseDetailsTab caseData={c} readOnly={readOnly} />
    if (tab === 'directions')
      return (
        <DirectionsTab
          caseData={c}
          readOnly={readOnly}
          onJumpToSource={onJumpToSource}
        />
      )
    if (tab === 'appeal') return <AppealAnalysisTab caseData={c} readOnly={readOnly} />
    if (tab === 'actions') return <ActionPlanTab caseData={c} readOnly={readOnly} />
    if (tab === 'pdf')
      return <PdfViewerTab caseData={c} activeDirectionId={activeDirection} />
    return null
  })()

  // Footer button mix depends on workflow stage + role
  const footer = (() => {
    if (stage === 'pending') {
      return (
        <>
          <Button
            variant="outline"
            icon={XIcon}
            onClick={onReject}
            disabled={busy != null || !canReview}
            className="!ring-danger/40 !text-danger hover:!bg-danger-soft"
          >
            {busy === 'reject' ? 'Rejecting…' : 'Reject'}
          </Button>
          {canApprove ? (
            <>
              <Button
                variant="outline"
                icon={CheckCheck}
                onClick={onMarkReviewed}
                disabled={busy != null}
              >
                {busy === 'review' ? 'Marking…' : 'Mark Reviewed'}
              </Button>
              <Button variant="success" icon={Check} size="lg" onClick={onApprove} disabled={busy != null}>
                {busy === 'approve' ? 'Approving…' : 'Approve & Verify'}
              </Button>
            </>
          ) : (
            <Button variant="success" icon={CheckCheck} size="lg" onClick={onMarkReviewed} disabled={busy != null}>
              {busy === 'review' ? 'Marking…' : 'Mark as Reviewed'}
            </Button>
          )}
        </>
      )
    }
    if (stage === 'reviewed') {
      if (!canApprove) {
        return (
          <span className="text-xs text-muted">
            Awaiting approver action. Approver-role users see Approve & Verify here.
          </span>
        )
      }
      return (
        <>
          <Button
            variant="outline"
            icon={XIcon}
            onClick={onReject}
            disabled={busy != null}
            className="!ring-danger/40 !text-danger hover:!bg-danger-soft"
          >
            {busy === 'reject' ? 'Rejecting…' : 'Reject'}
          </Button>
          <Button variant="success" icon={Check} size="lg" onClick={onApprove} disabled={busy != null}>
            {busy === 'approve' ? 'Approving…' : 'Approve & Verify'}
          </Button>
        </>
      )
    }
    return null
  })()

  return (
    <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line">
      {/* Header */}
      <div className="bg-gradient-to-r from-warning-soft via-warning-soft/70 to-gold/10 px-6 pb-5 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold tracking-wide text-warning">
                {c.case_number}
              </span>
              {c.dept_role && <Badge variant={c.dept_role}>Govt: {c.dept_role}</Badge>}
              {c.document_type && <Badge variant={c.document_type}>{c.document_type}</Badge>}
              {c.disposal_status && (
                <Badge variant={c.disposal_status}>{c.disposal_status.replace('_', ' ')}</Badge>
              )}
              <StageBadge stage={stage} />
              {c.cis_origin === 'cis_api' && <Badge variant="info">via CIS</Badge>}
            </div>
            <h2 className="mt-2 font-serif text-2xl font-semibold leading-snug text-ink">
              {c.title}
            </h2>
            <p className="mt-1 text-sm text-ink/70">
              {c.court}
              {c.bench ? ` · ${c.bench}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 ring-1 ring-line">
            <QualityRing value={quality} tone={tone} />
            <div className="leading-tight">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Extraction Quality
              </div>
              <div className={cn('font-serif text-xl font-semibold', QUALITY_RING[tone])}>
                {quality}%
              </div>
              <div className="text-[11px] text-muted">avg. confidence across directions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => {
            // In split view, the "PDF" tab is always visible on the left, so we hide its tab button.
            if (split && t.id === 'pdf') return null
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition',
                  active
                    ? 'border-b-2 border-gold text-ink'
                    : 'border-b-2 border-transparent text-muted hover:text-ink'
                )}
              >
                <t.icon className="h-4 w-4" strokeWidth={2.2} />
                {t.label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setSplit((v) => !v)}
          className="mr-2 inline-flex items-center gap-1.5 rounded-md bg-surface-alt px-2.5 py-1.5 text-[11px] font-semibold text-ink ring-1 ring-line hover:bg-surface"
          title={split ? 'Switch to stacked view' : 'Switch to split view'}
        >
          {split ? (
            <>
              <Rows3 className="h-3 w-3" /> Stacked View
            </>
          ) : (
            <>
              <Columns2 className="h-3 w-3" /> Split View
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="bg-surface px-6 py-6">
        <AIRecommendationBanner className="mb-5" />

        {split ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-[700px]">
              <PdfViewerTab caseData={c} activeDirectionId={activeDirection} />
            </div>
            <div className="h-[700px] overflow-y-auto pr-1">{tabContent}</div>
          </div>
        ) : (
          tabContent
        )}
      </div>

      {/* Workflow trail (small) */}
      {(c.reviewed_by || c.verified_by) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-line bg-surface-alt px-6 py-2.5 text-[11px] text-muted">
          <History className="h-3.5 w-3.5" />
          {c.reviewed_by && <span>First-reviewed by <strong className="text-ink">{c.reviewed_by}</strong></span>}
          {c.reviewed_by && c.verified_by && <span>·</span>}
          {c.verified_by && <span>Verified by <strong className="text-ink">{c.verified_by}</strong></span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-alt px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-success" strokeWidth={2.2} />
          {readOnly ? (
            <span>Read-only — your role cannot edit this case.</span>
          ) : (
            <span>Only verified records appear on the dashboard.</span>
          )}
        </div>
        <div className="flex items-center gap-2">{footer}</div>
      </div>
    </div>
  )
}

function StageBadge({ stage }) {
  if (stage === 'pending')
    return (
      <Badge variant="pending" icon={AlertTriangle}>
        Awaiting first review
      </Badge>
    )
  if (stage === 'reviewed')
    return (
      <Badge variant="info" icon={CheckCheck}>
        Reviewed · awaiting approver
      </Badge>
    )
  if (stage === 'verified') return <Badge variant="verified">Verified</Badge>
  if (stage === 'rejected') return <Badge variant="rejected">Rejected</Badge>
  return null
}

function QualityRing({ value, tone }) {
  const r = 22
  const c = 2 * Math.PI * r
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c
  const strokeMap = {
    success: 'stroke-success',
    warning: 'stroke-warning',
    danger: 'stroke-danger',
    muted: 'stroke-muted',
  }
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
      <circle cx="28" cy="28" r={r} className="fill-none stroke-line" strokeWidth="5" />
      <circle
        cx="28"
        cy="28"
        r={r}
        className={cn('fill-none transition-all', strokeMap[tone])}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
      />
    </svg>
  )
}
