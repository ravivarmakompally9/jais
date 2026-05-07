import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Review from './pages/Review'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import DepartmentView from './pages/DepartmentView'
import AppealTracker from './pages/AppealTracker'
import CauseList from './pages/CauseList'
import Calendar from './pages/Calendar'
import ActionPlan from './pages/ActionPlan'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/review" element={<Review />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/case/:id" element={<CaseDetail />} />
        <Route path="/departments" element={<DepartmentView />} />
        <Route path="/appeals" element={<AppealTracker />} />
        <Route path="/cause-list" element={<CauseList />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/action-plan" element={<ActionPlan />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="rounded-2xl bg-surface p-12 text-center shadow-card ring-1 ring-line">
      <h1 className="font-serif text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The route you tried to reach doesn't exist.</p>
    </div>
  )
}
