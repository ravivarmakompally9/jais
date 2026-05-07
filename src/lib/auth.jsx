// =====================================================================
// Authentication context
//
// Two modes:
//   - Demo (no Supabase) — credentials are accepted on the spot, profile
//     is stored in localStorage. Works offline, suitable for the demo.
//   - Supabase — uses email/password auth (signInWithPassword).
//
// Roles available (used by the multi-stage approval flow):
//   - reviewer  → can edit + mark as "reviewed"
//   - approver  → can also do the final "verify" step
//   - officer   → read-only (case detail, dashboard, cause list)
// =====================================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

const AuthCtx = createContext(null)
const STORAGE_KEY = 'jais.auth.user'

// Single demo profile. Logged-in user can switch roles from the topbar
// dropdown to test reviewer / approver / officer permissions.
export const DEMO_CREDENTIALS = {
  email: 'demo@jais.gov.in',
  password: 'demo1234',
}

const DEMO_PROFILES = {
  [DEMO_CREDENTIALS.email]: {
    id: 'demo-user',
    email: DEMO_CREDENTIALS.email,
    name: 'Demo User',
    designation: 'Joint Secretary (Demo)',
    role: 'approver',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate from localStorage so the user stays signed in across reloads
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        // Corrupted profile — clear and continue unauthenticated.
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const persist = useCallback((u) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
    setUser(u)
  }, [])

  const login = useCallback(async (email, password, roleHint) => {
    const lower = (email || '').toLowerCase().trim()

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lower,
        password,
      })
      if (error) throw error
      const profile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email,
        designation: data.user.user_metadata?.designation || '',
        role: data.user.user_metadata?.role || roleHint || 'reviewer',
      }
      persist(profile)
      return profile
    }

    // Demo mode: any email/password accepted; pre-built profiles get richer
    // metadata, anything else gets a generic reviewer profile.
    const known = DEMO_PROFILES[lower]
    const profile = known
      ? known
      : {
          id: 'demo-' + Math.random().toString(36).slice(2, 8),
          email: lower || 'demo@telangana.gov.in',
          name: humanizeFromEmail(lower),
          designation: 'Reviewer',
          role: roleHint || 'reviewer',
        }
    persist(profile)
    return profile
  }, [persist])

  // Demo / quick-profile sign-in. Always works regardless of whether
  // Supabase auth is configured — useful while real auth users haven't
  // been created in the Supabase project yet.
  const loginDemo = useCallback(
    async (email, roleHint) => {
      const lower = (email || '').toLowerCase().trim()
      const known = DEMO_PROFILES[lower]
      const profile = known
        ? known
        : {
            id: 'demo-' + Math.random().toString(36).slice(2, 8),
            email: lower || 'demo@telangana.gov.in',
            name: humanizeFromEmail(lower),
            designation: 'Reviewer',
            role: roleHint || 'reviewer',
          }
      persist(profile)
      return profile
    },
    [persist]
  )

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch {
        // Sign-out is best-effort: even if Supabase fails we clear the local profile.
      }
    }
    persist(null)
  }, [persist])

  const switchRole = useCallback(
    (newRole) => {
      if (!user) return
      persist({ ...user, role: newRole })
    },
    [user, persist]
  )

  const value = { user, loading, login, loginDemo, logout, switchRole, isSupabaseConfigured }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const v = useContext(AuthCtx)
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>')
  return v
}

function humanizeFromEmail(email) {
  if (!email) return 'Demo User'
  const left = email.split('@')[0]
  return left
    .split(/[._-]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

// Helper used everywhere we need a "by whom" tag on a write
export function actorTag(user) {
  if (!user) return 'Unknown'
  return user.designation ? `${user.name} (${user.designation})` : user.name
}
