import { Eye } from 'lucide-react'
import Badge from '../ui/Badge'
import EditableField from '../ui/EditableField'
import ConfidenceBar from '../ui/ConfidenceBar'
import SourceQuoteBlock from '../ui/SourceQuoteBlock'
import { patchDirection } from '../../lib/store'
import { useAuth, actorTag } from '../../lib/auth'

export default function DirectionsTab({ caseData, readOnly, onJumpToSource }) {
  const c = caseData
  const directions = c.directions || []
  const { user } = useAuth()
  const by = actorTag(user)

  if (!directions.length) {
    return (
      <div className="rounded-lg bg-surface-alt p-6 text-center text-sm text-muted ring-1 ring-line">
        No directions extracted from this judgment.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {directions.map((d, idx) => {
        const save = (field) => async (val) => {
          await patchDirection(c.id, d.id, field, val, by, d[field])
        }
        return (
          <div key={d.id} className="rounded-xl bg-surface p-5 shadow-soft ring-1 ring-line">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                Direction {idx + 1}
              </span>
              {d.timeline_type && <Badge variant={d.timeline_type}>{d.timeline_type}</Badge>}
              {d.page_reference != null && <Badge variant="muted">Page {d.page_reference}</Badge>}
              {onJumpToSource && d.source_quote && (
                <button
                  type="button"
                  onClick={() => onJumpToSource(d)}
                  className="ml-auto inline-flex items-center gap-1 rounded-md bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold ring-1 ring-gold/30 hover:bg-gold/20"
                  title="Highlight this source quote in the PDF view"
                >
                  <Eye className="h-3 w-3" /> View in PDF
                </button>
              )}
            </div>

            <EditableField
              label="Direction"
              value={d.direction_text}
              onSave={save('direction_text')}
              multiline
              readOnly={readOnly}
            />

            <div className="mt-4">
              <SourceQuoteBlock quote={d.source_quote} page={d.page_reference} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <EditableField label="Timeline" value={d.timeline} onSave={save('timeline')} readOnly={readOnly} />
              <EditableField
                label="Calculated Deadline"
                value={d.calculated_deadline}
                onSave={save('calculated_deadline')}
                type="date"
                mono
                readOnly={readOnly}
              />
            </div>

            <div className="mt-4">
              <ConfidenceBar confidence={d.confidence} reason={d.confidence_reason} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
