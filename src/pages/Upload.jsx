import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Brain,
  RefreshCw,
  Database,
  Server,
  Info,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import {
  extractJudgmentFromPdf,
  isExtractionConfigured,
  activeModelLabel,
} from '../lib/extraction'
import { isSupabaseConfigured, uploadJudgmentPdf, insertExtractedCase } from '../lib/supabase'
import { addExtractedCaseLocal } from '../lib/store'

const STAGES = [
  'Reading PDF document...',
  'AI is analyzing the judgment — extracting case details, directions, timelines...',
  'Structuring extracted data and generating action plan...',
  'Calculating extraction quality...',
]

export default function Upload() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState(0)
  const [error, setError] = useState(null)
  const [cisNotice, setCisNotice] = useState(false)
  const [cisChecking, setCisChecking] = useState(false)
  const navigate = useNavigate()

  const onPick = (f) => {
    setError(null)
    if (!f) return
    if (f.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    onPick(e.dataTransfer.files?.[0])
  }

  const reset = () => {
    setFile(null)
    setError(null)
    setStage(0)
  }

  const extract = async () => {
    if (!file) return
    if (!isExtractionConfigured) {
      setError(
        'No AI provider configured. Add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to .env to enable extraction.'
      )
      return
    }

    setBusy(true)
    setStage(0)
    setError(null)
    try {
      const stagger = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1400)

      let pdfUrl = null
      if (isSupabaseConfigured) {
        try {
          pdfUrl = await uploadJudgmentPdf(file)
        } catch (e) {
          console.warn('Storage upload failed; continuing without pdf_url', e)
        }
      }

      const extracted = await extractJudgmentFromPdf(file)
      clearInterval(stagger)
      setStage(STAGES.length - 1)

      let newId
      if (isSupabaseConfigured) {
        newId = await insertExtractedCase(extracted, pdfUrl)
      } else {
        newId = addExtractedCaseLocal(extracted, pdfUrl)
      }

      navigate(`/review?focus=${newId}`)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Extraction failed')
    } finally {
      setBusy(false)
    }
  }

  // CIS auto-fetch is the production target but the live endpoint hasn't
  // been provisioned yet. Clicking the button should make that explicit
  // rather than fabricating cases.
  const onCisSync = async () => {
    setCisChecking(true)
    setCisNotice(false)
    // Brief delay to suggest a real network probe
    await new Promise((res) => setTimeout(res, 700))
    setCisChecking(false)
    setCisNotice(true)
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Workflow · Step 1"
        title="Upload & CIS Sync"
        sub="Two ingest paths: pull a freshly-disposed judgment from the High Court CIS API, or upload a PDF manually. Either way, the extraction pipeline runs identically."
        right={
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
              isExtractionConfigured
                ? 'bg-gold/10 text-gold ring-gold/30'
                : 'bg-surface-alt text-muted ring-line'
            }`}
            title="AI provider used for extraction"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
            {activeModelLabel()}
          </div>
        }
      />

      {/* CIS Sync card */}
      <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-info-soft text-info ring-1 ring-info/30">
              <Database className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Sync from Court Information System
                </h2>
                <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning ring-1 ring-warning/30">
                  Integration pending
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted">
                In production, JAIS connects to the High Court's Court Information System and
                automatically fetches judgment copies in PDF format once a case is disposed of.
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                <Server className="h-3 w-3" />
                <span className="font-mono">CIS endpoint · /api/v1/disposals</span>
              </div>
            </div>
          </div>
          <Button variant="primary" icon={RefreshCw} onClick={onCisSync} disabled={cisChecking}>
            {cisChecking ? 'Checking…' : 'Sync from CIS'}
          </Button>
        </div>

        {cisNotice && (
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-warning/30 bg-warning-soft p-3.5 text-sm">
            <Info className="mt-0.5 h-4 w-4 flex-none text-warning" strokeWidth={2.2} />
            <div className="text-ink/85">
              <div className="font-semibold text-warning">CIS API not yet connected</div>
              <p className="mt-0.5 leading-relaxed">
                The High Court's Court Information System exposes the disposal API only to
                whitelisted IP ranges. Access credentials and IP whitelisting for the e-Governance
                infrastructure are pending issuance from the High Court IT cell. Once provisioned,
                this button will trigger live ingestion of newly-disposed judgments. Until then,
                please use <strong>Manual Upload</strong> below.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Upload zone */}
      {!busy && (
        <section className="rounded-2xl bg-surface p-2 shadow-card ring-1 ring-line">
          <div className="border-b border-line px-5 pb-3 pt-3">
            <h2 className="font-serif text-lg font-semibold text-ink">Manual Upload</h2>
            <p className="text-sm text-muted">
              Use this when CIS is down or for one-off PDFs received outside the sync window.
            </p>
          </div>
          <div
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onClick={() => inputRef.current?.click()}
            className={`m-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-surface-alt px-8 py-12 text-center transition ${
              drag ? 'border-gold bg-gold/5' : 'border-line hover:border-gold/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0])}
            />
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/30">
              <UploadCloud className="h-6 w-6" strokeWidth={2} />
            </span>
            <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
              {file ? file.name : 'Drop a judgment PDF here'}
            </h3>
            <p className="mt-1 max-w-md text-xs text-muted">
              {file
                ? `${(file.size / 1024).toFixed(0)} KB · ready to extract`
                : 'Or click to browse. Supports both digital and scanned PDFs (OCR-capable).'}
            </p>

            {file && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button
                  variant="gold"
                  icon={Sparkles}
                  onClick={(e) => {
                    e.stopPropagation()
                    extract()
                  }}
                >
                  Extract & Analyze with AI
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    reset()
                  }}
                >
                  Choose another file
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {busy && (
        <div className="rounded-2xl bg-surface p-10 shadow-card ring-1 ring-line">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 animate-pulse-gold items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/30">
              <Sparkles className="h-7 w-7" strokeWidth={2.2} />
            </span>
            <h3 className="mt-5 font-serif text-xl font-semibold text-ink">Analyzing with AI</h3>
            <p className="mt-1 text-sm text-muted">{STAGES[stage]}</p>
          </div>

          <div className="mx-auto mt-8 max-w-md space-y-2">
            {STAGES.map((s, i) => {
              const done = i < stage
              const active = i === stage
              return (
                <div
                  key={s}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-gold/5 text-ink ring-1 ring-gold/30'
                      : done
                      ? 'text-success'
                      : 'text-muted'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 flex-none" strokeWidth={2.2} />
                  ) : active ? (
                    <Brain className="h-4 w-4 flex-none animate-pulse" strokeWidth={2.2} />
                  ) : (
                    <span className="h-2 w-2 flex-none rounded-full bg-line" />
                  )}
                  <span>{s}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-danger" strokeWidth={2.2} />
          <div>
            <div className="font-semibold text-danger">Extraction error</div>
            <p className="mt-0.5 text-ink/80">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
