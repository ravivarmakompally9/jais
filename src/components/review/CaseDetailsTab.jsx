import EditableField from '../ui/EditableField'
import Badge from '../ui/Badge'
import { patchCase } from '../../lib/store'
import { useAuth, actorTag } from '../../lib/auth'

const DISPOSAL_OPTS = [
  { value: 'disposed', label: 'Disposed' },
  { value: 'partially_disposed', label: 'Partially Disposed' },
  { value: 'pending', label: 'Pending' },
]

export default function CaseDetailsTab({ caseData, readOnly }) {
  const c = caseData
  const { user } = useAuth()
  const by = actorTag(user)

  const save = (field) => async (val) => {
    await patchCase(c.id, field, val, by, c[field])
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        <EditableField label="Case Number" value={c.case_number} onSave={save('case_number')} mono readOnly={readOnly} />
        <EditableField label="Date of Order" value={c.date_of_order} onSave={save('date_of_order')} mono type="date" readOnly={readOnly} />

        <EditableField label="Court" value={c.court} onSave={save('court')} readOnly={readOnly} />
        <EditableField label="Bench" value={c.bench} onSave={save('bench')} readOnly={readOnly} />

        <EditableField label="Petitioner" value={c.petitioner} onSave={save('petitioner')} readOnly={readOnly} />
        <EditableField label="Respondent" value={c.respondent} onSave={save('respondent')} readOnly={readOnly} />

        <EditableField label="Department" value={c.department} onSave={save('department')} readOnly={readOnly} />

        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Disposal Status
          </div>
          <div className="flex gap-2">
            {DISPOSAL_OPTS.map((o) => {
              const active = c.disposal_status === o.value
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => patchCase(c.id, 'disposal_status', o.value, by, c.disposal_status)}
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Auto-detected:
        </span>
        {c.dept_role && <Badge variant={c.dept_role}>Govt: {c.dept_role}</Badge>}
        {c.document_type && <Badge variant={c.document_type}>{c.document_type} pdf</Badge>}
        {c.cis_origin === 'cis_api' && (
          <Badge variant="info">CIS auto-fetch · {c.cis_diary_no}</Badge>
        )}
      </div>

      <EditableField
        label="Summary"
        value={c.summary}
        onSave={save('summary')}
        multiline
        readOnly={readOnly}
        className="rounded-lg bg-surface-alt p-4 ring-1 ring-line"
      />
    </div>
  )
}
