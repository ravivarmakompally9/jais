# CCMS — Court Case Monitoring System

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

```bash
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:5173.

> **Demo mode**: if `.env` is empty, the app runs entirely on the three sample Telangana High Court cases bundled in `src/lib/sampleData.js`. You can demo every page — including review/approve/reject — without configuring Supabase or Claude.

## Supabase setup

1. Create a new Supabase project.
2. Open the **SQL editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql). It creates the four tables (`cases`, `directions`, `appeal_analysis`, `actions`), the `judgments` storage bucket, and permissive RLS policies for the demo.
3. Copy your project URL + anon key into `.env`.

## Claude API note

For the local-dev demo we call the Anthropic API directly from the browser (with `anthropic-dangerous-direct-browser-access: true`). **For production, route this through a backend** so the API key never reaches the client.

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
