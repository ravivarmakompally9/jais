import { useEffect, useMemo, useRef } from 'react'
import { FileText, ExternalLink } from 'lucide-react'

/**
 * Renders the judgment as a sequence of "pages" with the source quote(s)
 * for the active direction visually highlighted in yellow — directly inside
 * the page text. This is the literal "source highlights from PDF" the spec
 * asks for.
 *
 * Inputs:
 *   - pages: [{ page_number, text }]
 *   - directions: [{ source_quote, page_reference, ... }]
 *   - activeDirectionId: highlight only the matching direction's quote (and scroll to it)
 *   - pdfUrl: when present, an "Open original PDF" link is shown
 */
export default function SyntheticJudgmentView({ pages = [], directions = [], activeDirectionId, pdfUrl }) {
  const scrollRef = useRef(null)
  const pageRefs = useRef({})

  // Build a per-page list of quotes to highlight
  const highlightsByPage = useMemo(() => {
    const map = new Map()
    for (const d of directions) {
      if (!d.source_quote) continue
      const page = d.page_reference
      if (page == null) continue
      if (!map.has(page)) map.set(page, [])
      map.get(page).push({
        id: d.id,
        quote: d.source_quote,
        active: d.id === activeDirectionId,
      })
    }
    return map
  }, [directions, activeDirectionId])

  // Auto-scroll to the active direction's page when it changes
  useEffect(() => {
    if (!activeDirectionId) return
    const direction = directions.find((d) => d.id === activeDirectionId)
    if (!direction || direction.page_reference == null) return
    const el = pageRefs.current[direction.page_reference]
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeDirectionId, directions])

  if (!pages.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl bg-surface-alt p-12 text-center ring-1 ring-line">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface ring-1 ring-line">
          <FileText className="h-5 w-5 text-muted" strokeWidth={2.2} />
        </span>
        <h4 className="mt-4 font-serif text-lg font-semibold text-ink">No judgment text</h4>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Page-by-page text isn't available for this case. The original PDF link is below if it's
          attached.
        </p>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-info hover:underline"
          >
            Open original PDF <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-surface-alt ring-1 ring-line">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <FileText className="h-3.5 w-3.5" strokeWidth={2.2} />
          Judgment · {pages.length} page{pages.length === 1 ? '' : 's'}
        </div>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-info hover:underline"
          >
            Open original PDF <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Pages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-[640px] flex-col gap-5">
          {pages.map((p) => (
            <article
              key={p.page_number}
              ref={(el) => (pageRefs.current[p.page_number] = el)}
              className="rounded-md bg-white p-7 shadow-card ring-1 ring-line"
            >
              <div className="mb-4 flex items-center justify-between border-b border-line pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                <span>High Court · Judgment</span>
                <span className="font-mono">Page {p.page_number}</span>
              </div>
              <p className="font-serif text-[14.5px] leading-[1.85] text-ink">
                {renderPageWithHighlights(p.text, highlightsByPage.get(p.page_number) || [])}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

// Render a page's text with the matching source quotes wrapped in <mark>.
// Active direction → bright yellow + ring. Inactive → soft yellow.
function renderPageWithHighlights(text, highlights) {
  if (!highlights.length) return text

  // Find positions of each quote (case-sensitive substring match — quotes
  // are stored verbatim from the judgment so this is reliable).
  const ranges = highlights
    .map((h) => {
      const idx = text.indexOf(h.quote)
      if (idx === -1) return null
      return { start: idx, end: idx + h.quote.length, ...h }
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start)

  if (!ranges.length) return text

  // Build alternating segments: plain text + <mark>...</mark>
  const out = []
  let cursor = 0
  ranges.forEach((r, i) => {
    if (cursor < r.start) out.push(<span key={`p-${i}`}>{text.slice(cursor, r.start)}</span>)
    out.push(
      <mark
        key={`m-${i}`}
        id={`hl-${r.id}`}
        className={
          r.active
            ? 'rounded-sm bg-yellow-300/80 px-0.5 py-0.5 ring-2 ring-gold/60 transition'
            : 'rounded-sm bg-yellow-100 px-0.5 py-0.5 transition'
        }
      >
        {text.slice(r.start, r.end)}
      </mark>
    )
    cursor = r.end
  })
  if (cursor < text.length) out.push(<span key="tail">{text.slice(cursor)}</span>)
  return out
}
