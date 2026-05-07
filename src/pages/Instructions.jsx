import PageHeader from '../components/ui/PageHeader'

export default function Instructions() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Help" title="Project Instructions" sub="Minimal setup steps for JAIS." />

      <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
        <h2 className="font-serif text-lg font-semibold text-ink">Local</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink/85">
          <li>
            <span className="font-mono">npm install</span>
          </li>
          <li>
            <span className="font-mono">npm run dev</span> → open{' '}
            <span className="font-mono">http://localhost:5173</span>
          </li>
        </ol>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
        <h2 className="font-serif text-lg font-semibold text-ink">Supabase</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink/85">
          <li>Create a Supabase project.</li>
          <li>
            SQL Editor → run <span className="font-mono">supabase/schema.sql</span>
          </li>
          <li>
            Add env vars:
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
              <li>
                <span className="font-mono">VITE_SUPABASE_URL</span>
              </li>
              <li>
                <span className="font-mono">VITE_SUPABASE_ANON_KEY</span>
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
        <h2 className="font-serif text-lg font-semibold text-ink">AI key (optional)</h2>
        <p className="mt-3 text-sm text-ink/85">
          Add <span className="font-mono">VITE_ANTHROPIC_API_KEY</span> or{' '}
          <span className="font-mono">VITE_OPENAI_API_KEY</span>.
        </p>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
        <h2 className="font-serif text-lg font-semibold text-ink">Vercel</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink/85">
          <li>Import the repo in Vercel.</li>
          <li>
            Settings → Environment Variables → add the same <span className="font-mono">VITE_*</span> vars.
          </li>
          <li>Redeploy.</li>
        </ol>
      </section>
    </div>
  )
}

