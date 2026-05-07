import { Quote, FileText } from 'lucide-react'

// The "source highlight" — verbatim excerpt from the judgment.
// This is THE key trust feature: it lets the verifier compare the AI
// extraction against the authoritative source, in-place.
export default function SourceQuoteBlock({ quote, page }) {
  if (!quote) return null
  return (
    <div className="relative rounded-lg border-l-4 border-gold bg-gold/5 p-4 ring-1 ring-gold/20">
      <div className="flex items-start gap-3">
        <Quote className="mt-0.5 h-4 w-4 flex-none text-gold" strokeWidth={2.2} />
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gold">
            Source — Verbatim from judgment
          </div>
          <blockquote className="mt-1.5 font-serif text-[15px] italic leading-relaxed text-ink">
            {quote}
          </blockquote>
          {page != null && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted">
              <FileText className="h-3 w-3" />
              <span className="font-mono">Page {page}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
