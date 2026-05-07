import { CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { setActionStatus } from '../../lib/store'
import { useAuth, actorTag } from '../../lib/auth'
import { cn, formatDate } from '../../lib/utils'

const STATES = [
  { value: 'pending', label: 'Pending', icon: Clock, tone: 'bg-surface-alt text-muted ring-line' },
  { value: 'in_progress', label: 'In progress', icon: PlayCircle, tone: 'bg-warning-soft text-warning ring-warning/30' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, tone: 'bg-success-soft text-success ring-success/30' },
]

const ACTIVE_TONE = {
  pending: 'bg-muted text-white',
  in_progress: 'bg-warning text-white',
  completed: 'bg-success text-white',
}

export default function ActionStatusControls({ caseId, action, readOnly = false }) {
  const { user } = useAuth()
  const by = actorTag(user)

  const set = async (value) => {
    if (value === action.status) return
    await setActionStatus(caseId, action.id, value, by)
  }

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        Compliance status
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {STATES.map((s) => {
          const active = action.status === s.value
          return (
            <button
              key={s.value}
              type="button"
              disabled={readOnly}
              onClick={() => set(s.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition disabled:opacity-50',
                active ? ACTIVE_TONE[s.value] + ' ring-transparent' : s.tone + ' hover:bg-surface'
              )}
            >
              <s.icon className="h-3 w-3" strokeWidth={2.4} />
              {s.label}
            </button>
          )
        })}
      </div>
      {action.status_updated_by && (
        <p className="mt-2 text-[11px] text-muted">
          Last updated by <strong className="text-ink">{action.status_updated_by}</strong>
          {action.status_updated_at ? ` on ${formatDate(action.status_updated_at)}` : ''}.
          {action.completion_note ? ` Note: "${action.completion_note}"` : ''}
        </p>
      )}
    </div>
  )
}
