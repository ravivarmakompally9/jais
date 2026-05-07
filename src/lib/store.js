// =====================================================================
// Lightweight in-memory store + Supabase fallback
//
// Provides hooks and mutations for:
//   - cases / directions / appeal_analysis / actions
//   - audit_log (every edit, status change, workflow transition)
//   - notifications (deadline alerts, CIS sync events)
//   - cause_list (daily hearing list)
//
// Workflow:
//   pending → reviewed → verified
//                    → rejected
//
// In demo mode (no Supabase) every change is mirrored to in-memory state
// and broadcast to subscribers so all open hooks re-render.
// =====================================================================

import { useEffect, useState, useCallback } from 'react'
import {
  SAMPLE_CASES,
  SAMPLE_CAUSE_LIST,
  SAMPLE_NOTIFICATIONS,
  MOCK_CIS_POOL,
} from './sampleData'
import {
  isSupabaseConfigured,
  fetchCasesFull,
  fetchCaseById,
  setCaseStatus as supaSetCaseStatus,
  updateCase as supaUpdateCase,
  updateDirection as supaUpdateDirection,
  updateAppealAnalysis as supaUpdateAppealAnalysis,
  updateAction as supaUpdateAction,
  fetchAuditLog as supaFetchAuditLog,
  insertAuditLog as supaInsertAuditLog,
  fetchNotifications as supaFetchNotifications,
  insertNotification as supaInsertNotification,
  markNotificationRead as supaMarkNotificationRead,
  fetchCauseList as supaFetchCauseList,
  insertExtractedCase,
} from './supabase'

// ---------------------------------------------------------------
// Demo / in-memory store
// ---------------------------------------------------------------
let memoryCases = clone(SAMPLE_CASES)
let memoryCauseList = clone(SAMPLE_CAUSE_LIST)
let memoryNotifications = clone(SAMPLE_NOTIFICATIONS)
const subscribers = new Set()

function clone(v) { return JSON.parse(JSON.stringify(v)) }
function notify() { subscribers.forEach((fn) => fn()) }
function rid(prefix) { return `${prefix}-${Math.random().toString(36).slice(2, 9)}` }

// ---------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------
function useSubscribed(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const reload = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true }))
      const data = await loader()
      setState({ data, loading: false, error: null })
    } catch (e) {
      setState({ data: null, loading: false, error: e })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    reload()
    const fn = () => reload()
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  }, [reload])

  return { ...state, reload }
}

export function useAllCases() {
  const { data, loading, error, reload } = useSubscribed(async () => {
    if (isSupabaseConfigured) return (await fetchCasesFull()) || []
    return clone(memoryCases)
  })
  return { cases: data, loading, error, reload }
}

export function useCase(id) {
  const { data, loading, error, reload } = useSubscribed(
    async () => {
      if (isSupabaseConfigured) return await fetchCaseById(id)
      const c = memoryCases.find((x) => x.id === id) || null
      return c ? clone(c) : null
    },
    [id]
  )
  return { data, loading, error, reload }
}

export function useAuditLog(caseId) {
  const { data, loading, error, reload } = useSubscribed(
    async () => {
      if (isSupabaseConfigured) return (await supaFetchAuditLog(caseId)) || []
      const c = memoryCases.find((x) => x.id === caseId)
      return c ? clone(c.audit_log || []) : []
    },
    [caseId]
  )
  return { entries: data || [], loading, error, reload }
}

export function useNotifications() {
  const { data, loading, error, reload } = useSubscribed(async () => {
    if (isSupabaseConfigured) return (await supaFetchNotifications()) || []
    return clone(memoryNotifications)
  })
  return { notifications: data || [], loading, error, reload }
}

export function useCauseList() {
  const { data, loading, error, reload } = useSubscribed(async () => {
    if (isSupabaseConfigured) return (await supaFetchCauseList()) || []
    return clone(memoryCauseList)
  })
  return { entries: data || [], loading, error, reload }
}

// ---------------------------------------------------------------
// In-memory mutators
// ---------------------------------------------------------------
function patchMemoryCase(id, patch) {
  memoryCases = memoryCases.map((c) => (c.id === id ? { ...c, ...patch } : c))
  notify()
}

function patchMemoryDirection(caseId, dirId, patch) {
  memoryCases = memoryCases.map((c) =>
    c.id === caseId
      ? { ...c, directions: c.directions.map((d) => (d.id === dirId ? { ...d, ...patch } : d)) }
      : c
  )
  notify()
}

function patchMemoryAppeal(caseId, patch) {
  memoryCases = memoryCases.map((c) =>
    c.id === caseId ? { ...c, appeal_analysis: { ...(c.appeal_analysis || {}), ...patch } } : c
  )
  notify()
}

function patchMemoryAction(caseId, actId, patch) {
  memoryCases = memoryCases.map((c) =>
    c.id === caseId
      ? { ...c, actions: c.actions.map((a) => (a.id === actId ? { ...a, ...patch } : a)) }
      : c
  )
  notify()
}

function appendMemoryAudit(caseId, entry) {
  memoryCases = memoryCases.map((c) =>
    c.id === caseId
      ? { ...c, audit_log: [...(c.audit_log || []), entry] }
      : c
  )
  notify()
}

function appendMemoryNotification(n) {
  memoryNotifications = [n, ...memoryNotifications]
  notify()
}

// ---------------------------------------------------------------
// Audit-log writer used by every mutation
// ---------------------------------------------------------------
async function logAudit(caseId, payload) {
  const entry = {
    id: rid('al'),
    performed_at: new Date().toISOString(),
    ...payload,
  }
  if (isSupabaseConfigured) {
    await supaInsertAuditLog(caseId, entry)
  } else {
    appendMemoryAudit(caseId, entry)
  }
  return entry
}

// ---------------------------------------------------------------
// Workflow mutations
// ---------------------------------------------------------------
export async function markReviewed(caseId, performedBy) {
  if (isSupabaseConfigured) {
    await supaUpdateCase(caseId, {
      status: 'reviewed',
      reviewed_by: performedBy,
      reviewed_at: new Date().toISOString(),
    })
  } else {
    patchMemoryCase(caseId, {
      status: 'reviewed',
      reviewed_by: performedBy,
      reviewed_at: new Date().toISOString(),
    })
  }
  await logAudit(caseId, { action: 'reviewed', performed_by: performedBy })
  notify()
}

export async function approveCase(caseId, performedBy) {
  if (isSupabaseConfigured) {
    await supaSetCaseStatus(caseId, 'verified', performedBy)
  } else {
    patchMemoryCase(caseId, {
      status: 'verified',
      verified_by: performedBy,
      verified_at: new Date().toISOString(),
    })
  }
  await logAudit(caseId, { action: 'approved', performed_by: performedBy })
  notify()
}

export async function rejectCase(caseId, performedBy) {
  if (isSupabaseConfigured) {
    await supaSetCaseStatus(caseId, 'rejected')
  } else {
    patchMemoryCase(caseId, { status: 'rejected' })
  }
  await logAudit(caseId, { action: 'rejected', performed_by: performedBy })
  notify()
}

// ---------------------------------------------------------------
// Field edits (always audit-logged)
// ---------------------------------------------------------------
async function applyEdit({
  caseId,
  table,
  entityId,
  field,
  oldValue,
  newValue,
  performedBy,
  apply,
}) {
  await apply()
  await logAudit(caseId, {
    action: 'edit',
    entity_table: table,
    entity_id: entityId,
    field_name: field,
    old_value: oldValue == null ? null : String(oldValue),
    new_value: newValue == null ? null : String(newValue),
    performed_by: performedBy,
  })
}

export async function patchCase(id, field, newValue, performedBy, oldValue) {
  await applyEdit({
    caseId: id,
    table: 'cases',
    entityId: id,
    field,
    oldValue,
    newValue,
    performedBy,
    apply: async () => {
      if (isSupabaseConfigured) await supaUpdateCase(id, { [field]: newValue })
      else patchMemoryCase(id, { [field]: newValue })
    },
  })
  notify()
}

export async function patchDirection(caseId, dirId, field, newValue, performedBy, oldValue) {
  await applyEdit({
    caseId,
    table: 'directions',
    entityId: dirId,
    field,
    oldValue,
    newValue,
    performedBy,
    apply: async () => {
      if (isSupabaseConfigured) await supaUpdateDirection(dirId, { [field]: newValue })
      else patchMemoryDirection(caseId, dirId, { [field]: newValue })
    },
  })
  notify()
}

export async function patchAppeal(caseId, appealId, field, newValue, performedBy, oldValue) {
  await applyEdit({
    caseId,
    table: 'appeal_analysis',
    entityId: appealId,
    field,
    oldValue,
    newValue,
    performedBy,
    apply: async () => {
      if (isSupabaseConfigured) await supaUpdateAppealAnalysis(appealId, { [field]: newValue })
      else patchMemoryAppeal(caseId, { [field]: newValue })
    },
  })
  notify()
}

export async function patchAction(caseId, actId, field, newValue, performedBy, oldValue) {
  await applyEdit({
    caseId,
    table: 'actions',
    entityId: actId,
    field,
    oldValue,
    newValue,
    performedBy,
    apply: async () => {
      if (isSupabaseConfigured) await supaUpdateAction(actId, { [field]: newValue })
      else patchMemoryAction(caseId, actId, { [field]: newValue })
    },
  })
  notify()
}

// Action status is special — it gets a dedicated mutation that records
// who moved it to which state and an optional completion note.
export async function setActionStatus(caseId, actId, newStatus, performedBy, note) {
  const patch = {
    status: newStatus,
    status_updated_by: performedBy,
    status_updated_at: new Date().toISOString(),
  }
  if (note !== undefined) patch.completion_note = note
  if (isSupabaseConfigured) await supaUpdateAction(actId, patch)
  else patchMemoryAction(caseId, actId, patch)
  await logAudit(caseId, {
    action: 'status_changed',
    entity_table: 'actions',
    entity_id: actId,
    field_name: 'status',
    new_value: newStatus,
    performed_by: performedBy,
  })
  notify()
}

// ---------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------
export async function pushNotification(n) {
  const entry = {
    id: rid('n'),
    created_at: new Date().toISOString(),
    read_at: null,
    ...n,
  }
  if (isSupabaseConfigured) await supaInsertNotification(entry)
  else appendMemoryNotification(entry)
  notify()
  return entry
}

export async function markNotificationRead(id) {
  if (isSupabaseConfigured) await supaMarkNotificationRead(id)
  else {
    memoryNotifications = memoryNotifications.map((n) =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    )
  }
  notify()
}

export async function markAllNotificationsRead() {
  if (isSupabaseConfigured) {
    await Promise.all(
      memoryNotifications.filter((n) => !n.read_at).map((n) => supaMarkNotificationRead(n.id))
    )
  } else {
    const now = new Date().toISOString()
    memoryNotifications = memoryNotifications.map((n) =>
      n.read_at ? n : { ...n, read_at: now }
    )
  }
  notify()
}

// ---------------------------------------------------------------
// CIS sync — pulls from MOCK_CIS_POOL in demo, no-ops if pool empty
// ---------------------------------------------------------------
let cisCursor = 0
export async function syncFromCis() {
  // In real life this would hit the CIS REST endpoint and fetch
  // newly-disposed judgments. We simulate it by drawing from the mock pool.
  const existing = new Set(
    (isSupabaseConfigured ? (await fetchCasesFull()) || [] : memoryCases).map(
      (c) => c.cis_diary_no
    )
  )
  const candidate = MOCK_CIS_POOL[cisCursor % MOCK_CIS_POOL.length]
  cisCursor += 1

  if (existing.has(candidate.cis_diary_no)) {
    await pushNotification({
      type: 'cis_synced',
      severity: 'info',
      message: `CIS sync — no new disposals (last checked ${formatNow()}).`,
    })
    return { newCases: 0 }
  }

  if (isSupabaseConfigured) {
    await insertExtractedCase(candidate, null)
  } else {
    addExtractedCaseLocal(candidate, null, /* origin */ 'cis_api', candidate.cis_diary_no)
  }

  await pushNotification({
    type: 'cis_synced',
    severity: 'info',
    message: `CIS sync — new judgment fetched: ${candidate.case_number} (${candidate.title}).`,
    link: '/review',
  })

  return { newCases: 1, candidate }
}

function formatNow() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------
// Adding an extracted case in demo mode
// ---------------------------------------------------------------
export function addExtractedCaseLocal(extracted, pdfUrl, origin = 'manual_upload', diaryNo = null) {
  const id = rid('case')
  const directions = (extracted.directions || []).map((d, i) => ({
    id: `${id}-d${i}`,
    direction_text: d.text,
    source_quote: d.sourceQuote,
    timeline: d.timeline,
    timeline_type: d.timelineType,
    calculated_deadline: d.calculatedDeadline,
    confidence: d.confidence,
    confidence_reason: d.confidenceReason,
    page_reference: d.page,
    sort_order: i,
  }))
  const avgConf = directions.length
    ? Math.round(directions.reduce((s, d) => s + (d.confidence || 0), 0) / directions.length)
    : null
  const cs = {
    id,
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
    reviewed_by: null,
    reviewed_at: null,
    verified_by: null,
    verified_at: null,
    pdf_url: pdfUrl || null,
    cis_origin: origin,
    cis_diary_no: diaryNo,
    created_at: new Date().toISOString(),
    directions,
    appeal_analysis: extracted.appealAnalysis
      ? {
          id: id + '-aa',
          recommendation: extracted.appealAnalysis.recommendation,
          limitation_period: extracted.appealAnalysis.limitationPeriod,
          limitation_deadline: extracted.appealAnalysis.limitationDeadline,
          appeal_court: extracted.appealAnalysis.appealCourt,
          grounds: extracted.appealAnalysis.grounds,
          reasoning: extracted.appealAnalysis.reasoning,
          risk_if_no_appeal: extracted.appealAnalysis.riskIfNoAppeal,
        }
      : null,
    actions: (extracted.actions || []).map((a, i) => ({
      id: `${id}-a${i}`,
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
    })),
    judgment_pages: extracted.judgment_pages || [],
    audit_log: [],
  }
  memoryCases = [cs, ...memoryCases]
  notify()
  return id
}

function derivePriority(extracted) {
  const acts = extracted.actions || []
  if (acts.some((a) => (a.priority) === 'critical')) return 'critical'
  if (acts.some((a) => (a.priority) === 'high')) return 'high'
  if (acts.some((a) => (a.priority) === 'medium')) return 'medium'
  return 'low'
}

// ---------------------------------------------------------------
// Misc selectors
// ---------------------------------------------------------------
export function unreadCount(notifications) {
  return notifications.filter((n) => !n.read_at).length
}
