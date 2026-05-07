import { cn } from '../../lib/utils'

const TONES = {
  critical: 'bg-danger',
  high: 'bg-warning',
  medium: 'bg-info',
  low: 'bg-muted',
}

export default function PriorityDot({ priority, className }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 flex-none rounded-full',
        TONES[priority] || TONES.low,
        className
      )}
    />
  )
}
