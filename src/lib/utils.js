// Tiny class-name joiner
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

// ---------- Dates ----------
export function formatDate(d) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateLong(d) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
}

export function daysUntil(deadline) {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24))
  return diff
}

export function deadlineLabel(deadline) {
  const days = daysUntil(deadline)
  if (days === null) return '—'
  if (days < 0) return `OVERDUE by ${Math.abs(days)}d`
  if (days === 0) return 'DUE TODAY'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export function deadlineTone(deadline) {
  const days = daysUntil(deadline)
  if (days === null) return 'muted'
  if (days < 0) return 'danger'
  if (days <= 30) return 'warning'
  return 'muted'
}

// ---------- Confidence ----------
export function confidenceTone(c) {
  if (c == null) return 'muted'
  if (c >= 90) return 'success'
  if (c >= 75) return 'warning'
  return 'danger'
}

export function confidenceLabel(c) {
  if (c == null) return '—'
  if (c >= 90) return 'High'
  if (c >= 75) return 'Medium'
  return 'Low'
}

// ---------- Pretty labels ----------
export function prettyEnum(s) {
  if (!s) return ''
  return s.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

export const recommendationCopy = {
  no_appeal: {
    title: 'No Appeal Recommended',
    tone: 'success',
    sub: 'Compliance is the recommended path forward.',
  },
  consider_appeal: {
    title: 'Consider Filing Appeal',
    tone: 'warning',
    sub: 'Significant grounds exist — review with the competent authority.',
  },
  strong_consider_appeal: {
    title: 'Strongly Consider Filing Appeal',
    tone: 'danger',
    sub: 'High legal or financial exposure — escalate immediately.',
  },
}
