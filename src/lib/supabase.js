import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anon)

export const supabase = isSupabaseConfigured
  ? createClient(url, anon, { auth: { persistSession: true } })
  : null

// =========================================================
// Cases
// =========================================================
export async function fetchCases({ status } = {}) {
  if (!supabase) return null
  let q = supabase.from('cases').select('*').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function fetchCaseById(id) {
  if (!supabase) return null
  const [{ data: cs, error: e1 }, { data: dirs, error: e2 }, { data: aa, error: e3 }, { data: acts, error: e4 }, { data: pages, error: e5 }] =
    await Promise.all([
      supabase.from('cases').select('*').eq('id', id).single(),
      supabase.from('directions').select('*').eq('case_id', id).order('sort_order'),
      supabase.from('appeal_analysis').select('*').eq('case_id', id).maybeSingle(),
      supabase.from('actions').select('*').eq('case_id', id).order('sort_order'),
      supabase.from('judgment_pages').select('*').eq('case_id', id).order('page_number'),
    ])
  if (e1 || e2 || e3 || e4 || e5) throw e1 || e2 || e3 || e4 || e5
  return {
    ...cs,
    directions: dirs || [],
    appeal_analysis: aa || null,
    actions: acts || [],
    judgment_pages: pages || [],
  }
}

export async function fetchCasesFull({ status } = {}) {
  if (!supabase) return null
  const cases = await fetchCases({ status })
  if (!cases?.length) return []
  // Defensive: if the upstream list contains duplicates for any reason,
  // avoid duplicated UI entries.
  const uniq = []
  const seen = new Set()
  for (const c of cases) {
    if (!c?.id || seen.has(c.id)) continue
    seen.add(c.id)
    uniq.push(c)
  }
  return Promise.all(uniq.map((c) => fetchCaseById(c.id)))
}

export async function insertExtractedCase(extracted, pdfUrl, origin = 'manual_upload', diaryNo = null) {
  if (!supabase) throw new Error('Supabase not configured')

  // Best-effort de-duplication:
  // - CIS ingests should be unique by cis_diary_no
  // - Manual uploads can be re-submitted; prevent obvious duplicates by case_number + date_of_order + title
  try {
    if (diaryNo) {
      const { data } = await supabase
        .from('cases')
        .select('id')
        .eq('cis_diary_no', diaryNo)
        .limit(1)
      if (data?.[0]?.id) return data[0].id
    } else {
      const caseNumber = extracted.caseNumber || extracted.case_number
      const dateOfOrder = extracted.dateOfOrder || extracted.date_of_order
      const title = extracted.title
      if (caseNumber && dateOfOrder && title) {
        const { data } = await supabase
          .from('cases')
          .select('id')
          .eq('case_number', caseNumber)
          .eq('date_of_order', dateOfOrder)
          .eq('title', title)
          .order('created_at', { ascending: false })
          .limit(1)
        if (data?.[0]?.id) return data[0].id
      }
    }
  } catch {
    // Ignore de-dup probe errors; proceed with insert.
  }

  const directions = extracted.directions || []
  const avgConf = directions.length
    ? Math.round(directions.reduce((s, d) => s + (d.confidence || 0), 0) / directions.length)
    : null

  const { data: cs, error: e1 } = await supabase
    .from('cases')
    .insert({
      case_number: extracted.caseNumber || extracted.case_number,
      title: extracted.title,
      court: extracted.court,
      bench: extracted.bench,
      date_of_order: extracted.dateOfOrder || extracted.date_of_order,
      date_of_filing: extracted.dateOfFiling || extracted.date_of_filing,
      petitioner: extracted.petitioner,
      respondent: extracted.respondent,
      dept_role: extracted.deptRole || extracted.dept_role,
      disposal_status: extracted.disposalStatus || extracted.disposal_status,
      document_type: extracted.documentType || extracted.document_type,
      extraction_quality: avgConf,
      summary: extracted.summary,
      department: extracted.department,
      priority: derivePriority(extracted),
      status: 'pending',
      pdf_url: pdfUrl,
      cis_origin: origin,
      cis_diary_no: diaryNo,
    })
    .select()
    .single()
  if (e1) throw e1

  if (directions.length) {
    const rows = directions.map((d, i) => ({
      case_id: cs.id,
      direction_text: d.text || d.direction_text,
      source_quote: d.sourceQuote || d.source_quote,
      timeline: d.timeline,
      timeline_type: d.timelineType || d.timeline_type,
      calculated_deadline: d.calculatedDeadline || d.calculated_deadline,
      confidence: d.confidence,
      confidence_reason: d.confidenceReason || d.confidence_reason,
      page_reference: d.page || d.page_reference,
      sort_order: i,
    }))
    const { error } = await supabase.from('directions').insert(rows)
    if (error) throw error
  }

  if (extracted.appealAnalysis) {
    const a = extracted.appealAnalysis
    const { error } = await supabase.from('appeal_analysis').insert({
      case_id: cs.id,
      recommendation: a.recommendation,
      limitation_period: a.limitationPeriod || a.limitation_period,
      limitation_deadline: a.limitationDeadline || a.limitation_deadline,
      appeal_court: a.appealCourt || a.appeal_court,
      grounds: a.grounds,
      reasoning: a.reasoning,
      risk_if_no_appeal: a.riskIfNoAppeal || a.risk_if_no_appeal,
    })
    if (error) throw error
  }

  if (extracted.actions?.length) {
    const rows = extracted.actions.map((a, i) => ({
      case_id: cs.id,
      action_type: a.type || a.action_type,
      nature_of_action: a.natureOfAction || a.nature_of_action,
      description: a.description,
      department: a.department,
      responsible_authority: a.responsibleAuthority || a.responsible_authority,
      timeline: a.timeline,
      timeline_type: a.timelineType || a.timeline_type,
      deadline: a.deadline,
      priority: a.priority,
      status: a.status || 'pending',
      sort_order: i,
    }))
    const { error } = await supabase.from('actions').insert(rows)
    if (error) throw error
  }

  if (extracted.judgment_pages?.length) {
    const rows = extracted.judgment_pages.map((p) => ({
      case_id: cs.id,
      page_number: p.page_number,
      text: p.text,
    }))
    const { error } = await supabase.from('judgment_pages').insert(rows)
    if (error) throw error
  }

  return cs.id
}

function derivePriority(extracted) {
  const acts = extracted.actions || []
  if (acts.some((a) => a.priority === 'critical')) return 'critical'
  if (acts.some((a) => a.priority === 'high')) return 'high'
  if (acts.some((a) => a.priority === 'medium')) return 'medium'
  return 'low'
}

// =========================================================
// Generic table helpers
// =========================================================
export async function setCaseStatus(id, status, verifiedBy = null) {
  if (!supabase) throw new Error('Supabase not configured')
  const patch = { status }
  if (status === 'verified') {
    patch.verified_by = verifiedBy
    patch.verified_at = new Date().toISOString()
  }
  const { error } = await supabase.from('cases').update(patch).eq('id', id)
  if (error) throw error
}
export async function updateCase(id, patch) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('cases').update(patch).eq('id', id)
  if (error) throw error
}
export async function updateDirection(id, patch) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('directions').update(patch).eq('id', id)
  if (error) throw error
}
export async function updateAppealAnalysis(id, patch) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('appeal_analysis').update(patch).eq('id', id)
  if (error) throw error
}
export async function updateAction(id, patch) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('actions').update(patch).eq('id', id)
  if (error) throw error
}

// =========================================================
// Audit log
// =========================================================
export async function fetchAuditLog(caseId) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('case_id', caseId)
    .order('performed_at', { ascending: false })
  if (error) throw error
  return data || []
}
export async function insertAuditLog(caseId, entry) {
  if (!supabase) return
  const { error } = await supabase.from('audit_log').insert({ case_id: caseId, ...entry })
  if (error) throw error
}

// =========================================================
// Notifications
// =========================================================
export async function fetchNotifications() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data || []
}
export async function insertNotification(n) {
  if (!supabase) return
  const { error } = await supabase.from('notifications').insert(n)
  if (error) throw error
}
export async function markNotificationRead(id) {
  if (!supabase) return
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// =========================================================
// Cause list
// =========================================================
export async function fetchCauseList() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('cause_list')
    .select('*')
    .order('hearing_date', { ascending: true })
  if (error) throw error
  return data || []
}

// =========================================================
// Storage
// =========================================================
export async function uploadJudgmentPdf(file) {
  if (!supabase) return null
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { error } = await supabase.storage.from('judgments').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'application/pdf',
  })
  if (error) throw error
  const { data } = supabase.storage.from('judgments').getPublicUrl(path)
  return data.publicUrl
}
