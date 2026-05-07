import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn, confidenceTone, confidenceLabel } from '../../lib/utils'

const TONE_CLASSES = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  muted: 'bg-muted',
}

const TONE_TEXT = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  muted: 'text-muted',
}

export default function ConfidenceBar({ confidence, reason, compact = false }) {
  const [open, setOpen] = useState(false)
  const tone = confidenceTone(confidence)
  const label = confidenceLabel(confidence)
  const pct = Math.max(0, Math.min(100, confidence ?? 0))

  return (
    <div className={compact ? '' : 'rounded-lg bg-surface-alt p-3 ring-1 ring-line'}>
      <div className="flex items-center gap-3">
        <div className="min-w-[56px] text-xs font-semibold uppercase tracking-wider text-muted">
          Confidence
        </div>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div
            className={cn('absolute inset-y-0 left-0 rounded-full transition-all', TONE_CLASSES[tone])}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className={cn('font-mono text-xs font-semibold tabular-nums', TONE_TEXT[tone])}>
          {confidence != null ? `${confidence}%` : '—'}
        </div>
        <div className={cn('text-[10px] font-semibold uppercase tracking-wider', TONE_TEXT[tone])}>
          {label}
        </div>
        {reason && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted ring-1 ring-line transition hover:bg-surface hover:text-ink"
            aria-label="Why this confidence"
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        )}
      </div>

      {open && reason && (
        <div className="mt-3 rounded-md bg-surface p-3 text-xs leading-relaxed text-ink ring-1 ring-line">
          <span className="block font-semibold uppercase tracking-wider text-muted text-[10px]">
            Why this confidence
          </span>
          <p className="mt-1">{reason}</p>
        </div>
      )}
    </div>
  )
}
