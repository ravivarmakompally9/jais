import { Sparkles } from 'lucide-react'

// Banner reinforcing "decision support, not automation".
// Shown at the top of every AI-generated section.
export default function AIRecommendationBanner({
  title = 'AI Recommendation',
  message = 'All data below is AI-extracted. Review each field, verify against the source PDF, and approve or edit before it enters the trusted dashboard.',
  className = '',
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5 p-3.5 ${className}`}
    >
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-gold text-white">
        <Sparkles className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <div className="flex-1 leading-snug">
        <div className="text-xs font-semibold uppercase tracking-wider text-gold">{title}</div>
        <p className="mt-0.5 text-[13px] text-ink">{message}</p>
      </div>
    </div>
  )
}
