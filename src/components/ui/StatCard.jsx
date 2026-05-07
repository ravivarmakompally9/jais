import { cn } from '../../lib/utils'

const TONES = {
  blue: 'bg-info-soft text-info',
  red: 'bg-danger-soft text-danger',
  amber: 'bg-warning-soft text-warning',
  green: 'bg-success-soft text-success',
  gold: 'bg-gold/10 text-gold',
}

export default function StatCard({ icon: Icon, label, value, sub, tone = 'blue' }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-card ring-1 ring-line">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-ink">{value}</p>
        </div>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', TONES[tone])}>
          {Icon && <Icon className="h-5 w-5" strokeWidth={2.2} />}
        </span>
      </div>
      {sub && <p className="mt-3 text-xs text-muted">{sub}</p>}
    </div>
  )
}
