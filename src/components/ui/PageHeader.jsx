export default function PageHeader({ eyebrow, title, sub, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-sm text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  )
}
