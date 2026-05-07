import SyntheticJudgmentView from './SyntheticJudgmentView'

/**
 * Two modes:
 *   - When the case has parsed page-by-page text (CIS auto-fetch / sample
 *     data), render the SyntheticJudgmentView with in-place highlighting.
 *   - When the case only has a raw PDF URL (manual upload that we couldn't
 *     parse server-side), embed the PDF in an iframe.
 */
export default function PdfViewerTab({ caseData, activeDirectionId }) {
  const pages = caseData.judgment_pages || []

  if (pages.length > 0) {
    return (
      <div className="h-[680px]">
        <SyntheticJudgmentView
          pages={pages}
          directions={caseData.directions || []}
          activeDirectionId={activeDirectionId}
          pdfUrl={caseData.pdf_url}
        />
      </div>
    )
  }

  if (caseData.pdf_url) {
    return (
      <div className="overflow-hidden rounded-xl ring-1 ring-line">
        <iframe
          src={caseData.pdf_url}
          title="Judgment PDF"
          className="h-[680px] w-full bg-white"
        />
      </div>
    )
  }

  return (
    <SyntheticJudgmentView
      pages={[]}
      directions={[]}
      pdfUrl={null}
    />
  )
}
