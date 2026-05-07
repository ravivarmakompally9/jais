import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Files,
  Upload as UploadIcon,
  ShieldCheck,
  Building2,
  Gavel,
  Scale,
  BadgeCheck,
  CalendarDays,
  ListOrdered,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const SECTIONS = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/cases', label: 'All Cases', icon: Files },
      { to: '/cause-list', label: 'Cause List', icon: ListOrdered },
    ],
  },
  {
    title: 'Workflow',
    items: [
      { to: '/upload', label: 'Upload & CIS Sync', icon: UploadIcon },
      { to: '/review', label: 'Review & Verify', icon: ShieldCheck },
      { to: '/action-plan', label: 'Action Plan', icon: Sparkles },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { to: '/departments', label: 'Department View', icon: Building2 },
      { to: '/appeals', label: 'Appeal Tracker', icon: Gavel },
      { to: '/calendar', label: 'Important Dates', icon: CalendarDays },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col bg-sidebar text-white/85">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold/15 text-gold ring-1 ring-gold/40">
            <Scale className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold text-white">JAIS</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">
              Case Monitoring
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/10'
                          : 'text-white/65 hover:bg-white/5 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 flex-none" strokeWidth={2.2} />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-start gap-2.5 rounded-lg bg-gold/10 p-3 ring-1 ring-gold/30">
          <BadgeCheck className="mt-0.5 h-4 w-4 flex-none text-gold" strokeWidth={2.2} />
          <div className="leading-snug">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gold">
              Human-Verified Only
            </div>
            <p className="mt-1 text-[11px] text-white/65">
              Dashboard displays only approved records. AI outputs are advisory — not automated decisions.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
