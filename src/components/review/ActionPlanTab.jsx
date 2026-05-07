import { ShieldCheck, Gavel, Sparkles, CalendarClock } from 'lucide-react'
import Badge from '../ui/Badge'
import EditableField from '../ui/EditableField'
import { patchAction } from '../../lib/store'
import { useAuth, actorTag } from '../../lib/auth'
import { cn } from '../../lib/utils'

const PRIORITY_OPTS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const TIMELINE_OPTS = [
  { value: 'explicit', label: 'Explicit' },
  { value: 'inferred', label: 'Inferred' },
]

const TYPE_META = {
  compliance: {
    title: 'Compliance Actions',
    subtitle: 'Steps the government must take to comply with the order',
    icon: ShieldCheck,
    tone: 'text-info',
    bgTone: 'bg-info-soft/40 ring-info/30',
  },
  appeal_consideration: {
    title: 'Appeal-Consideration Actions',
    subtitle: 'Steps for the appeal pathway — limitation, briefings, decisions',
    icon: Gavel,
    tone: 'text-warning',
    bgTone: 'bg-warning-soft/40 ring-warning/30',
  },
}

export default function ActionPlanTab({ caseData, readOnly }) {
  const c = caseData
  const actions = c.actions || []
  const { user } = useAuth()
  const by = actorTag(user)

  if (!actions.length) {
    return (
      <div className="rounded-lg bg-surface-alt p-6 text-center text-sm text-muted ring-1 ring-line">
        No actions generated for this case.
      </div>
    )
  }

  const counts = {
    total: actions.length,
    compliance: actions.filter((a) => a.action_type === 'compliance').length,
    appeal: actions.filter((a) => a.action_type === 'appeal_consideration').length,
    critical: actions.filter((a) => a.priority === 'critical').length,
    explicit: actions.filter((a) => a.timeline_type === 'explicit').length,
    inferred: actions.filter((a) => a.timeline_type === 'inferred').length,
    financial: actions.filter((a) => a.nature_of_action === 'financial').length,
    administrative: actions.filter((a) => a.nature_of_action === 'administrative').length,
    legal: actions.filter((a) => a.nature_of_action === 'legal').length,
    regulatory: actions.filter((a) => a.nature_of_action === 'regulatory').length,
  }

  const groups = {
    compliance: actions.filter((a) => a.action_type === 'compliance'),
    appeal_consideration: actions.filter((a) => a.action_type === 'appeal_consideration'),
  }

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="rounded-xl bg-gradient-to-r from-gold/5 via-surface-alt to-info-soft/30 p-5 ring-1 ring-line">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-gold/15 text-gold ring-1 ring-gold/30">
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div className="flex-1">
            <h3 className="font-serif text-base font-semibold text-ink">Action Plan Summary</h3>
            <p className="mt-1 text-xs text-muted">
              AI-structured around the four spec dimensions: what is required (Compliance/Appeal),
              key timelines (Explicit/Inferred), responsible department, and nature of action.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              <SummaryStat label="Total" value={counts.total} />
              <SummaryStat label="Compliance" value={counts.compliance} tone="text-info" />
              <SummaryStat label="Appeal" value={counts.appeal} tone="text-warning" />
              <SummaryStat label="Critical" value={counts.critical} tone="text-danger" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
              <Chip icon={CalendarClock}>Explicit timeline · {counts.explicit}</Chip>
              <Chip icon={CalendarClock}>Inferred timeline · {counts.inferred}</Chip>
              {counts.financial > 0 && <Chip>Financial · {counts.financial}</Chip>}
              {counts.administrative > 0 && <Chip>Administrative · {counts.administrative}</Chip>}
              {counts.legal > 0 && <Chip>Legal · {counts.legal}</Chip>}
              {counts.regulatory > 0 && <Chip>Regulatory · {counts.regulatory}</Chip>}
            </div>
          </div>
        </div>
      </div>

      {/* Grouped action list */}
      {['compliance', 'appeal_consideration'].map((type) => {
        const list = groups[type]
        if (!list?.length) return null
        const meta = TYPE_META[type]
        return (
          <section key={type} className="space-y-3">
            <header className={cn('rounded-lg px-4 py-3 ring-1', meta.bgTone)}>
              <div className="flex items-center gap-2.5">
                <meta.icon className={cn('h-4 w-4', meta.tone)} strokeWidth={2.2} />
                <div>
                  <h3 className={cn('font-serif text-base font-semibold', meta.tone)}>
                    {meta.title}{' '}
                    <span className="font-mono text-xs font-normal opacity-60">· {list.length}</span>
                  </h3>
                  <p className="text-[11px] text-ink/65">{meta.subtitle}</p>
                </div>
              </div>
            </header>

            {list.map((a, idx) => (
              <ActionCard
                key={a.id}
                action={a}
                index={idx}
                caseId={c.id}
                by={by}
                readOnly={readOnly}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}

function ActionCard({ action: a, index, caseId, by, readOnly }) {
  const save = (field) => async (val) => {
    await patchAction(caseId, a.id, field, val, by, a[field])
  }

  return (
    <div className="rounded-xl bg-surface p-5 shadow-soft ring-1 ring-line">
      {/* What is required */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
          Action {index + 1}
        </span>
        <Badge variant={a.priority}>{a.priority}</Badge>
        <Badge variant={a.nature_of_action}>{a.nature_of_action}</Badge>
        {a.timeline_type && <Badge variant={a.timeline_type}>{a.timeline_type} timeline</Badge>}
      </div>

      <EditableField
        label="Description"
        value={a.description}
        onSave={save('description')}
        multiline
        readOnly={readOnly}
      />

      {/* Timeline block — explicit/inferred + narrative + deadline */}
      <div className="mt-4 rounded-lg bg-surface-alt p-3 ring-1 ring-line">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
          <CalendarClock className="h-3 w-3" />
          Key timeline
        </div>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <EditableField
            label="Timeline (narrative)"
            value={a.timeline}
            onSave={save('timeline')}
            readOnly={readOnly}
          />
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Timeline type
            </div>
            <div className="flex gap-1.5">
              {TIMELINE_OPTS.map((o) => {
                const active = a.timeline_type === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    disabled={readOnly}
                    onClick={() => patchAction(caseId, a.id, 'timeline_type', o.value, by, a.timeline_type)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition disabled:opacity-50',
                      active
                        ? o.value === 'explicit'
                          ? 'bg-info text-white ring-info'
                          : 'bg-warning text-white ring-warning'
                        : 'bg-surface text-ink ring-line hover:bg-surface-alt'
                    )}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
          <EditableField
            label="Deadline (computed)"
            value={a.deadline}
            onSave={save('deadline')}
            type="date"
            mono
            readOnly={readOnly}
          />
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Priority
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITY_OPTS.map((o) => {
                const active = a.priority === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    disabled={readOnly}
                    onClick={() => patchAction(caseId, a.id, 'priority', o.value, by, a.priority)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition disabled:opacity-50 ${
                      active
                        ? 'bg-ink text-white ring-ink'
                        : 'bg-surface text-ink ring-line hover:bg-surface-alt'
                    }`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Responsible department */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <EditableField
          label="Department"
          value={a.department}
          onSave={save('department')}
          readOnly={readOnly}
        />
        <EditableField
          label="Responsible Authority"
          value={a.responsible_authority}
          onSave={save('responsible_authority')}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

function SummaryStat({ label, value, tone = 'text-ink' }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-0.5 font-serif text-2xl font-semibold leading-none', tone)}>
        {value}
      </div>
    </div>
  )
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-2 py-0.5 font-semibold uppercase tracking-wider text-muted ring-1 ring-line">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}
