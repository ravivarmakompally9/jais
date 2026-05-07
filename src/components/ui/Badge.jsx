import { cn } from '../../lib/utils'

// Variant → tailwind class map. Centralized so the visual language stays
// consistent across the entire app.
const VARIANTS = {
  // Priority
  critical: 'bg-danger-soft text-danger ring-1 ring-danger/30',
  high: 'bg-warning-soft text-warning ring-1 ring-warning/30',
  medium: 'bg-info-soft text-info ring-1 ring-info/30',
  low: 'bg-surface-alt text-muted ring-1 ring-line',

  // Status
  verified: 'bg-success-soft text-success ring-1 ring-success/30',
  pending: 'bg-warning-soft text-warning ring-1 ring-warning/30',
  rejected: 'bg-danger-soft text-danger ring-1 ring-danger/30',

  // Timeline type
  explicit: 'bg-info-soft text-info ring-1 ring-info/30',
  inferred: 'bg-warning-soft text-warning ring-1 ring-warning/30',

  // Dept role
  petitioner: 'bg-purple-100 text-purple-800 ring-1 ring-purple-300',
  respondent: 'bg-pink-100 text-pink-800 ring-1 ring-pink-300',

  // Nature of action
  financial: 'bg-success-soft text-success ring-1 ring-success/30',
  administrative: 'bg-info-soft text-info ring-1 ring-info/30',
  legal: 'bg-warning-soft text-warning ring-1 ring-warning/30',
  regulatory: 'bg-purple-100 text-purple-800 ring-1 ring-purple-300',

  // Document type
  digital: 'bg-success-soft text-success ring-1 ring-success/30',
  scanned: 'bg-warning-soft text-warning ring-1 ring-warning/30',

  // Disposal status
  disposed: 'bg-success-soft text-success ring-1 ring-success/30',
  partially_disposed: 'bg-warning-soft text-warning ring-1 ring-warning/30',

  // Action type
  compliance: 'bg-info-soft text-info ring-1 ring-info/30',
  appeal_consideration: 'bg-warning-soft text-warning ring-1 ring-warning/30',

  // Generic
  gold: 'bg-gold/10 text-gold ring-1 ring-gold/30',
  muted: 'bg-surface-alt text-muted ring-1 ring-line',
  success: 'bg-success-soft text-success ring-1 ring-success/30',
  danger: 'bg-danger-soft text-danger ring-1 ring-danger/30',
  warning: 'bg-warning-soft text-warning ring-1 ring-warning/30',
  info: 'bg-info-soft text-info ring-1 ring-info/30',
}

const ACTION_TYPE_LABEL = {
  compliance: 'Compliance',
  appeal_consideration: 'Appeal Decision',
}

export default function Badge({ variant = 'muted', children, className, icon: Icon, dot, label }) {
  const v = VARIANTS[variant] || VARIANTS.muted
  const display = children ?? label ?? humanize(variant)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        v,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.2} />}
      {display}
    </span>
  )
}

function humanize(v) {
  if (v === 'appeal_consideration') return ACTION_TYPE_LABEL.appeal_consideration
  return (v || '').replace(/_/g, ' ')
}
