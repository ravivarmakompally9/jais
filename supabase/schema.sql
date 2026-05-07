-- =====================================================================
-- JAIS — Judgment AI System
-- Supabase / PostgreSQL schema
-- Run this in the Supabase SQL editor (or via psql) on a fresh project.
-- =====================================================================

create extension if not exists "pgcrypto";

-- =========================
-- cases
-- =========================
create table if not exists public.cases (
  id                  uuid primary key default gen_random_uuid(),
  case_number         text not null,
  title               text not null,
  court               text,
  bench               text,
  date_of_order       date,
  date_of_filing      date,
  petitioner          text,
  respondent          text,
  dept_role           text check (dept_role in ('petitioner', 'respondent')),
  disposal_status     text check (disposal_status in ('disposed', 'partially_disposed', 'pending')),
  document_type       text check (document_type in ('digital', 'scanned')),
  extraction_quality  integer,
  summary             text,
  department          text,
  priority            text check (priority in ('critical', 'high', 'medium', 'low')),
  -- Two-stage approval workflow:
  --   pending      → first reviewer hasn't acted
  --   reviewed     → first reviewer marked it ready for the approver
  --   verified     → approver has signed off; visible on dashboard
  --   rejected     → discarded at any stage
  status              text check (status in ('pending', 'reviewed', 'verified', 'rejected')) default 'pending',
  reviewed_by         text,
  reviewed_at         timestamptz,
  verified_by         text,
  verified_at         timestamptz,
  pdf_url             text,
  cis_origin          text, -- 'manual_upload' | 'cis_api' (auto-fetched)
  cis_diary_no        text,
  created_at          timestamptz default now()
);

create index if not exists cases_status_idx     on public.cases (status);
create index if not exists cases_priority_idx   on public.cases (priority);
create index if not exists cases_department_idx on public.cases (department);

-- =========================
-- directions
-- =========================
create table if not exists public.directions (
  id                  uuid primary key default gen_random_uuid(),
  case_id             uuid references public.cases(id) on delete cascade,
  direction_text      text not null,
  source_quote        text,
  timeline            text,
  timeline_type       text check (timeline_type in ('explicit', 'inferred')),
  calculated_deadline date,
  confidence          integer check (confidence between 0 and 100),
  confidence_reason   text,
  page_reference      integer,
  sort_order          integer
);

create index if not exists directions_case_idx on public.directions (case_id);

-- =========================
-- appeal_analysis
-- =========================
create table if not exists public.appeal_analysis (
  id                  uuid primary key default gen_random_uuid(),
  case_id             uuid references public.cases(id) on delete cascade unique,
  recommendation      text check (recommendation in ('no_appeal', 'consider_appeal', 'strong_consider_appeal')),
  limitation_period   text,
  limitation_deadline date,
  appeal_court        text,
  grounds             text,
  reasoning           text,
  risk_if_no_appeal   text
);

-- =========================
-- actions
-- =========================
create table if not exists public.actions (
  id                    uuid primary key default gen_random_uuid(),
  case_id               uuid references public.cases(id) on delete cascade,
  action_type           text check (action_type in ('compliance', 'appeal_consideration')),
  nature_of_action      text check (nature_of_action in ('financial', 'administrative', 'legal', 'regulatory')),
  description           text not null,
  department            text,
  responsible_authority text,
  -- Timelines: action-level (key spec requirement — "explicit or inferred")
  timeline              text,
  timeline_type         text check (timeline_type in ('explicit', 'inferred')),
  deadline              date,
  priority              text check (priority in ('critical', 'high', 'medium', 'low')),
  status                text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  status_updated_by     text,
  status_updated_at     timestamptz,
  completion_note       text,
  sort_order            integer
);

-- Idempotent column adds (for projects that ran an earlier schema version)
alter table public.actions add column if not exists timeline      text;
alter table public.actions add column if not exists timeline_type text;
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'actions_timeline_type_check'
  ) then
    alter table public.actions
      add constraint actions_timeline_type_check
      check (timeline_type in ('explicit', 'inferred'));
  end if;
end $$;

create index if not exists actions_case_idx       on public.actions (case_id);
create index if not exists actions_department_idx on public.actions (department);
create index if not exists actions_status_idx     on public.actions (status);

-- =========================
-- judgment_pages — synthetic page text used for in-PDF highlighting
--   When JAIS pulls a judgment from CIS, the parsed text is stored
--   page-by-page so the verifier can see source quotes highlighted in
--   place (the spec calls this "source highlights from PDF").
-- =========================
create table if not exists public.judgment_pages (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid references public.cases(id) on delete cascade,
  page_number   integer not null,
  text          text not null
);

create index if not exists judgment_pages_case_idx on public.judgment_pages (case_id, page_number);

-- =========================
-- audit_log — every edit and workflow transition
-- =========================
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid references public.cases(id) on delete cascade,
  entity_table  text,    -- 'cases' | 'directions' | 'actions' | 'appeal_analysis'
  entity_id     uuid,
  field_name    text,
  old_value     text,
  new_value     text,
  action        text,    -- 'edit' | 'reviewed' | 'approved' | 'rejected' | 'status_changed'
  performed_by  text,
  performed_at  timestamptz default now()
);

create index if not exists audit_log_case_idx on public.audit_log (case_id, performed_at desc);

-- =========================
-- notifications — deadline alerts + system events
-- =========================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid references public.cases(id) on delete cascade,
  type        text,    -- 'deadline_approaching' | 'limitation_warning' | 'cis_synced' | 'pending_review'
  message     text not null,
  severity    text check (severity in ('info', 'warning', 'critical')),
  link        text,    -- optional in-app URL
  created_at  timestamptz default now(),
  read_at     timestamptz
);

create index if not exists notifications_unread_idx on public.notifications (read_at, created_at desc);

-- =========================
-- cause_list — daily cause list pulled from CIS
-- =========================
create table if not exists public.cause_list (
  id            uuid primary key default gen_random_uuid(),
  hearing_date  date not null,
  court         text,
  bench         text,
  case_number   text,
  case_id       uuid references public.cases(id) on delete set null,
  parties       text,
  listing_type  text,  -- 'fresh' | 'admission' | 'final_hearing' | 'pronouncement' | 'compliance_report'
  item_no       integer,
  remarks       text
);

create index if not exists cause_list_date_idx on public.cause_list (hearing_date, item_no);

-- =========================
-- Storage bucket for uploaded judgment PDFs
-- =========================
insert into storage.buckets (id, name, public)
values ('judgments', 'judgments', true)
on conflict (id) do nothing;

-- =========================
-- Row Level Security
-- =========================
alter table public.cases             enable row level security;
alter table public.directions        enable row level security;
alter table public.appeal_analysis   enable row level security;
alter table public.actions           enable row level security;
alter table public.judgment_pages    enable row level security;
alter table public.audit_log         enable row level security;
alter table public.notifications     enable row level security;
alter table public.cause_list        enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array[
    'cases','directions','appeal_analysis','actions',
    'judgment_pages','audit_log','notifications','cause_list'
  ]) loop
    execute format('drop policy if exists "auth full %s" on public.%I', t, t);
    execute format(
      'create policy "auth full %s" on public.%I for all to authenticated using (true) with check (true)',
      t, t
    );
    execute format('drop policy if exists "anon read %s" on public.%I', t, t);
    execute format(
      'create policy "anon read %s" on public.%I for select to anon using (true)',
      t, t
    );
    execute format('drop policy if exists "anon write %s" on public.%I', t, t);
    execute format(
      'create policy "anon write %s" on public.%I for all to anon using (true) with check (true)',
      t, t
    );
  end loop;
end$$;
