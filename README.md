# JAIS — Judgment AI System

AI-powered judgment-extraction + human-verified action plans, built for the Centre for e-Governance (Government of Telangana).

The system:

1. Reads court judgment PDFs with **Claude (Sonnet 4)** — direct PDF document input, no fragile OCR pipeline.
2. Generates structured case details, court directions (with verbatim source quotes), an appeal analysis with limitation deadlines, and a department-aware action plan.
3. Forces a **mandatory human-verification** checkpoint before any record reaches the dashboard.
4. Surfaces only verified data on the trusted dashboard, department view, and appeal tracker.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router
- **Backend**: Supabase (Postgres + Storage + RLS)
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`) — PDFs sent as `document` content
- **Icons**: lucide-react

## Setup

### 1) Run locally (quick start)

```bash
npm install
npm run dev
```

Open http://localhost:5173.

> **Demo mode**: If you do not configure any keys, the app runs on the bundled sample cases in `src/lib/sampleData.js`. You can demo the UI (including review/approve/reject) without Supabase or any AI provider.

### 2) Configure Supabase (database + storage)

1. Create a new Supabase project.
2. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
   - This creates tables (`cases`, `directions`, `appeal_analysis`, `actions`, etc.), the `judgments` storage bucket, and demo-friendly RLS policies.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### Local env file (optional)

Create `.env` in the project root and add:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 3) Configure an AI provider (optional)

Pick one:

- **Anthropic**: set `VITE_ANTHROPIC_API_KEY`
- **OpenAI**: set `VITE_OPENAI_API_KEY`

#### Local env file (optional)

```bash
VITE_ANTHROPIC_API_KEY=...
# OR
VITE_OPENAI_API_KEY=...
```

### 4) Deploy on Vercel

1. Import the repo into Vercel.
2. In the Vercel project, open **Settings → Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY` (if using Anthropic) **or** `VITE_OPENAI_API_KEY` (if using OpenAI)
3. **Redeploy** (required). Vite injects `VITE_*` variables at build time.

> Note: This project includes `vercel.json` to ensure React Router deep links (e.g. `/upload`) do not 404.

## Claude API note (security)

For the local-dev demo we call the Anthropic API directly from the browser (with `anthropic-dangerous-direct-browser-access: true`). **For production, route this through a backend** so the API key never reaches the client.

## Troubleshooting

### "Could not find the 'timeline' column of 'actions' in the schema cache"

This means your Supabase project is missing the `actions.timeline` column (or PostgREST hasn’t reloaded its schema cache).

1. In Supabase → **SQL Editor**, run:

```sql
alter table public.actions add column if not exists timeline text;
alter table public.actions add column if not exists timeline_type text;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'actions_timeline_type_check'
  ) then
    alter table public.actions
      add constraint actions_timeline_type_check
      check (timeline_type in ('explicit', 'inferred'));
  end if;
end $$;

select pg_notify('pgrst', 'reload schema');
```

2. Refresh the app and retry extraction.

## Project structure

```
src/
├── App.jsx                     # Router
├── main.jsx                    # Entry
├── lib/
│   ├── supabase.js             # Supabase client + queries
│   ├── claude.js               # PDF → JSON extraction pipeline
│   ├── store.js                # React hooks; Supabase ↔ in-memory fallback
│   ├── sampleData.js           # 3 sample Telangana High Court cases
│   └── utils.js                # cn(), date helpers, confidence helpers
├── components/
│   ├── layout/   (Sidebar, Layout)
│   ├── ui/       (Badge, Button, StatCard, ConfidenceBar,
│   │              SourceQuoteBlock, AIRecommendationBanner,
│   │              EditableField, PageHeader, PriorityDot)
│   └── review/   (ReviewCard + 5 tab components)
└── pages/
    ├── Dashboard.jsx
    ├── Upload.jsx
    ├── Review.jsx              # The most critical page
    ├── Cases.jsx
    ├── CaseDetail.jsx
    ├── DepartmentView.jsx
    └── AppealTracker.jsx
```

## How the constraints map to the build

| Constraint                                              | Where it lives                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| Source highlights from the PDF                          | `SourceQuoteBlock` — golden-bordered verbatim quote on every direction |
| Limitation period for appeals                           | `AppealAnalysisTab` + dedicated `AppealTracker` page                  |
| Explicit vs. inferred timelines                         | `timeline_type` column → `Badge` on every direction                   |
| Comply OR appeal decision                               | `appeal_analysis.recommendation` → 3-tone recommendation card         |
| Responsible authority                                   | `actions.responsible_authority` (specific designation, not vague dept)|
| Disposal status                                         | `cases.disposal_status` → badge throughout                            |
| Dept role (petitioner/respondent)                       | `cases.dept_role` → badge throughout, drives action plan tone         |
| Outputs must be explainable                             | `confidence_reason` → expandable on every `ConfidenceBar`             |
| Decision support, not automation                        | `AIRecommendationBanner` on every AI-generated section                |
| Nature of action                                        | `actions.nature_of_action` (financial / administrative / legal / regulatory) |
| Scanned vs. digital PDFs                                | `cases.document_type` → badge; OCR-aware confidence reasons           |
| Extraction quality                                      | Computed average of confidences → quality ring on `ReviewCard` header |
| Only verified records on dashboard                      | All page queries filter `status = 'verified'`                         |
