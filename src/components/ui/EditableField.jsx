import { useEffect, useRef, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Click-to-edit field. Pass `multiline` for textarea, `mono` for case
 * numbers/dates, and `onSave(newValue)` to persist.
 *
 * The "save" calls onSave async and only commits visually if it resolves.
 */
export default function EditableField({
  label,
  value,
  onSave,
  multiline = false,
  mono = false,
  placeholder = '—',
  type = 'text',
  className,
  inputClassName,
  readOnly = false,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      if (ref.current.select) ref.current.select()
    }
  }, [editing])

  const start = () => {
    if (readOnly) return
    setDraft(value ?? '')
    setEditing(true)
  }

  const cancel = () => {
    setDraft(value ?? '')
    setEditing(false)
  }

  const commit = async () => {
    if (draft === (value ?? '')) {
      setEditing(false)
      return
    }
    setBusy(true)
    try {
      await onSave(draft)
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') cancel()
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      commit()
    }
  }

  return (
    <div className={cn('group rounded-md', className)}>
      {label && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </div>
      )}

      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              ref={ref}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={4}
              className={cn(
                'flex-1 resize-y rounded-md border border-gold/50 bg-white px-3 py-2 text-sm text-ink shadow-soft outline-none focus:border-gold',
                mono && 'font-mono',
                inputClassName
              )}
            />
          ) : (
            <input
              ref={ref}
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className={cn(
                'flex-1 rounded-md border border-gold/50 bg-white px-3 py-2 text-sm text-ink shadow-soft outline-none focus:border-gold',
                mono && 'font-mono',
                inputClassName
              )}
            />
          )}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={commit}
              disabled={busy}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-success text-white hover:brightness-95 disabled:opacity-50"
              aria-label="Save"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-alt text-ink ring-1 ring-line hover:bg-line"
              aria-label="Cancel"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      ) : readOnly ? (
        <div
          className={cn(
            'flex w-full items-start gap-2 rounded-md px-3 py-2 ring-1 ring-transparent',
            mono && 'font-mono'
          )}
        >
          <span
            className={cn(
              'flex-1 whitespace-pre-wrap text-sm text-ink',
              !value && 'italic text-muted',
              multiline ? 'leading-relaxed' : ''
            )}
          >
            {value || placeholder}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={start}
          className={cn(
            'flex w-full items-start justify-between gap-2 rounded-md px-3 py-2 text-left ring-1 ring-transparent transition hover:bg-surface-alt hover:ring-line',
            mono && 'font-mono'
          )}
        >
          <span
            className={cn(
              'flex-1 whitespace-pre-wrap text-sm text-ink',
              !value && 'italic text-muted',
              multiline ? 'leading-relaxed' : ''
            )}
          >
            {value || placeholder}
          </span>
          <Pencil className="mt-1 h-3.5 w-3.5 flex-none text-muted opacity-0 transition group-hover:opacity-100" />
        </button>
      )}
    </div>
  )
}
