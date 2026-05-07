import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../lib/auth'

export default function Layout() {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="font-mono text-xs text-muted">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ next: loc.pathname + loc.search }} replace />
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Sidebar />
      <main className="ml-[250px] min-h-screen">
        <Topbar />
        <div className="mx-auto max-w-[1300px] px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
