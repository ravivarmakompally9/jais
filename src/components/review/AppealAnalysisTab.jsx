import { Gavel, AlertTriangle, Clock, Building2 } from 'lucide-react'
import EditableField from '../ui/EditableField'
import { patchAppeal } from '../../lib/store'
import { useAuth, actorTag } from '../../lib/auth'
import { recommendationCopy, formatDate, deadlineLabel, deadlineTone, cn } from '../../lib/utils'

const TONE_BG = {
  success: 'bg-success-soft border-success/30 text-success',
  warning: 'bg-warning-soft border-warning/30 text-warning',
  danger: 'bg-danger-soft border-danger/30 text-danger',
}

export default function AppealAnalysisTab({ caseData, readOnly }) {
  const c = caseData
  const aa = c.appeal_analysis
  const { user } = useAuth()
  const by = actorTag(user)

  if (!aa) {
    return (
      <div className="rounded-lg bg-surface-alt p-6 text-center text-sm text-muted ring-1 ring-line">
        No appeal analysis available for this case.
      </div>
    )
  }

  const meta = recommendationCopy[aa.recommendation] || recommendationCopy.no_appeal
  const dlTone = deadlineTone(aa.limitation_deadline)
  const save = (field) => async (val) => {
    await patchAppeal(c.id, aa.id, field, val, by, aa[field])
  }

  return (
    <div className="space-y-6">
      <div className={cn('rounded-xl border-l-4 p-5', TONE_BG[meta.tone])}>
        <div className="flex items-start gap-3">
          <Gavel className="mt-1 h-5 w-5 flex-none" strokeWidth={2.2} />
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              AI Recommendation
            </div>
            <h3 className="mt-1 font-serif text-2xl font-semibold">{meta.title}</h3>
            <p className="mt-2 text-[13px] text-ink/85">
              {meta.sub} This is an AI-generated recommendation for decision support. Final decision rests
              with the competent authority.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-surface p-4 shadow-soft ring-1 ring-line">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
            Limitation Period
          </div>
          <p className="mt-2 text-sm font-medium text-ink">{aa.limitation_period || '—'}</p>
          {aa.limitation_deadline && (
            <div className="mt-3 flex items-center justify-between rounded-md bg-surface-alt px-3 py-2 ring-1 ring-line">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Deadline</div>
                <div className="font-mono text-sm text-ink">{formatDate(aa.limitation_deadline)}</div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  dlTone === 'danger' && 'bg-danger-soft text-danger',
                  dlTone === 'warning' && 'bg-warning-soft text-warning',
                  dlTone === 'muted' && 'bg-surface text-muted ring-1 ring-line'
                )}
              >
                {deadlineLabel(aa.limitation_deadline)}
              </span>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-surface p-4 shadow-soft ring-1 ring-line">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <Building2 className="h-3.5 w-3.5" strokeWidth={2.2} />
            Appeal Court
          </div>
          <p className="mt-2 text-sm font-medium text-ink">{aa.appeal_court || '—'}</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface p-4 shadow-soft ring-1 ring-line">
        <EditableField
          label="Grounds for Appeal"
          value={aa.grounds}
          onSave={save('grounds')}
          multiline
          readOnly={readOnly}
        />
      </div>

      <div className="rounded-lg bg-surface p-4 shadow-soft ring-1 ring-line">
        <EditableField
          label="AI Reasoning"
          value={aa.reasoning}
          onSave={save('reasoning')}
          multiline
          readOnly={readOnly}
        />
      </div>

      <div className="rounded-lg border-l-4 border-danger bg-danger-soft p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-danger" strokeWidth={2.2} />
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-danger">
              Risk if No Appeal
            </div>
            <EditableField
              value={aa.risk_if_no_appeal}
              onSave={save('risk_if_no_appeal')}
              multiline
              readOnly={readOnly}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
