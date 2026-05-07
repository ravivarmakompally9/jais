import { cn } from '../../lib/utils'

const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-sidebar shadow-soft',
  gold: 'bg-gold text-white hover:brightness-95 shadow-soft',
  success: 'bg-success text-white hover:brightness-95 shadow-soft',
  danger: 'bg-danger text-white hover:brightness-95 shadow-soft',
  ghost: 'bg-transparent text-ink hover:bg-surface-alt',
  outline: 'bg-surface text-ink ring-1 ring-line hover:bg-surface-alt',
  subtle: 'bg-surface-alt text-ink hover:bg-line/80',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  icon: Icon,
  iconRight: IconRight,
  children,
  ...rest
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={2.2} />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" strokeWidth={2.2} />}
    </button>
  )
}
